/**
 * @swagger
 * /api/payment:
 *   post:
 *     summary: Tạo giao dịch thanh toán cho order
 *     description: |
 *       Sau khi tạo payment thành công, frontend **PHẢI gọi API `/api/check-balance`**
 *       để kiểm tra ví có đủ số dư trước khi gửi transaction blockchain.
 *     tags:
 *       - Payment
*     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             order_id: "11111111-1111-1111-1111-111111111111"
 *     responses:
 *       200:
 *         description: Tạo payment thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 payment_id: "uuid"
 *                 order_id: "uuid"
 *                 status: "PENDING"
 *                 note: "from_wallet và to_wallet hiện đang NULL (chưa tích hợp ví)"
 *       400:
 *         description: Order không hợp lệ hoặc đã hết hạn
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/helper/authenHelper";
import { createPayment } from "@/app/helper/paymentHelper";
import { paymentLimiter } from "@/app/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user_id = decoded.user_id;

    const key = `payment-${user_id}`;

    const { success, limit, remaining, reset } =
      await paymentLimiter.limit(key);

    if (!success) {
      return NextResponse.json(
        { message: "Too many payment requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    const body = await req.json();
    const { order_id, from_wallet, to_wallet } = body;

    if (!order_id) {
      return NextResponse.json(
        { message: "order_id is required" },
        { status: 400 }
      );
    }



    const result = await createPayment({
      order_id,
      user_id,
      from_wallet,
      to_wallet,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (err: any) {
    console.error("Payment error:", err);

    return NextResponse.json(
      { message: err.message || "Server error" },
      { status: 500 }
    );
  }
}
/**
 * @swagger
 * /api/order/{id}:
 *   post:
 *     summary: Lấy thông tin đơn hàng theo order_id
 *     description: |
 *       ⚠️ API này yêu cầu người dùng phải đăng nhập trước (cookieAuth).
 *       Chỉ user đã login mới có thể truy cập order của mình.
 *     tags:
 *       - Order
 *
 *     security:
 *       - cookieAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_id
 *             properties:
 *               order_id:
 *                 type: string
 *                 example: "ORD123456"
 *
 *     responses:
 *       200:
 *         description: Lấy order thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 order_id: "ORD123456"
 *                 user_id: "USR98765"
 *                 concert_id: "CON456789"
 *                 total_amount: 150
 *                 currency: "USD"
 *                 order_status: "paid"
 *                 note: "Đặt vé VIP"
 *
 *       401:
 *         description: Chưa đăng nhập hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized - Please login first"
 *
 *       404:
 *         description: Order không tồn tại
 *
 *       500:
 *         description: Server error
 */
import { NextRequest, NextResponse } from "next/server";
import { getSpecificOrder } from "@/app/helper/orderHelper";
import { verifyToken } from "@/app/helper/authenHelper";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    const { order_id } = await req.json();

    if (!order_id) {
      return NextResponse.json(
        { message: "order_id is required" },
        { status: 400 }
      );
    }

    const result = await getSpecificOrder(order_id);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
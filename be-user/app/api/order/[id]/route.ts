/**
 * @swagger
 * /api/order/{id}:
 *   post:
 *     summary: Lấy thông tin một đơn hàng theo order_id
 *     tags:
 *       - Order
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: ID của đơn hàng cần lấy
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
 *                 description: ID của đơn hàng cần lấy
 *             example:
 *               order_id: "ORD123456"
 *     responses:
 *       200:
 *         description: Thông tin đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     order_id:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     concert_id:
 *                       type: string
 *                     total_amount:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     order_status:
 *                       type: string
 *                     wallet_address:
 *                       type: string
 *                     payment_id:
 *                       type: string
 *                     note:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                     expires_at:
 *                       type: string
 *                     paid_at:
 *                       type: string
 *                     updated_at:
 *                       type: string
 *                   example:
 *                     order_id: "ORD123456"
 *                     user_id: "USR98765"
 *                     concert_id: "CON456789"
 *                     total_amount: 150.00
 *                     currency: "USD"
 *                     order_status: "paid"
 *                     wallet_address: "0xAbc1234567890Def"
 *                     payment_id: "PAY987654321"
 *                     note: "Đặt vé VIP"
 *                     created_at: "2026-04-08T08:00:00Z"
 *                     expires_at: "2026-04-10T08:00:00Z"
 *                     paid_at: "2026-04-08T08:05:00Z"
 *                     updated_at: "2026-04-08T08:10:00Z"
 *       401:
 *         description: Unauthorized, token không hợp lệ hoặc hết hạn
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 *       404:
 *         description: Đơn hàng không tồn tại
 *         content:
 *           application/json:
 *             example:
 *               message: "Order not found"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
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

    const body = await req.json();
    const { order_id } = body;
    if (!order_id) {
      return NextResponse.json(
        { message: "order_id is required" },
        { status: 400 }
      );
    }

    const result = await getSpecificOrder(order_id);
    if (!result) {
      return NextResponse.json(
        { message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
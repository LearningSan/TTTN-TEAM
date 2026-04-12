/**
 * @swagger
 * /api/order:
 *   post:
 *     summary: Tạo đơn hàng (order) sau khi chọn ghế
 *     tags:
 *       - Order
*     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             concert_id: "11111111-1111-1111-1111-111111111111"
 *             currency: "USDT"
 *             note: "test order"
 *             items:
 *               - zone_id: "A"
 *                 seat_id: "A1"
 *                 quantity: 1
 *               - zone_id: "A"
 *                 seat_id: "A2"
 *                 quantity: 1
 *     responses:
 *       200:
 *         description: Tạo order thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 order:
 *                   order_id: "uuid"
 *                   user_id: "uuid"
 *                   concert_id: "uuid"
 *                   total_amount: 200
 *                   currency: "USDT"
 *                   order_status: "PENDING"
 *                   note: "test order"
 *                   created_at: "2026-01-01T10:00:00Z"
 *                   expires_at: "2026-01-01T10:15:00Z"
 *                 items:
 *                   - zone_id: "A"
 *                     seat_id: "A1"
 *                     quantity: 1
 *                     unit_price: 100
 *                     subtotal: 100
 *                 summary:
 *                   total_items: 2
 *                   total_quantity: 2
 *                   total_amount: 200
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/helper/authenHelper";
import { createOrder } from "@/app/helper/orderHelper";
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

    const user_id = decoded.user_id; 

    const body = await req.json();
    const { concert_id, items, currency, note } = body;

    const result = await createOrder({ user_id, concert_id, items, currency, note })

   return NextResponse.json({
  success: true,
  data: result
});

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
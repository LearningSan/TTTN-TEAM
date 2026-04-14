/**
 * @swagger
 * /api/order:
 *   post:
 *     summary: Tạo đơn hàng sau khi chọn zone / seat

 *     tags:
 *       - Order
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
 *               - concert_id
 *               - currency
 *               - items
 *             properties:
 *               concert_id:
 *                 type: string
 *                 example: "11111111-1111-1111-1111-111111111111"
 *
 *               currency:
 *                 type: string
 *                 example: "USDT"
 *
 *               note:
 *                 type: string
 *                 example: "test order"
 *
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - zone_id
 *                     - quantity
 *                   properties:
 *                     zone_id:
 *                       type: string
 *                       example: "A"
 *
 *                     seat_id:
 *                       type: string
 *                       description: "Chỉ bắt buộc nếu zone có has_seat_map = true"
 *                       example: "A1"
 *
 *                     quantity:
 *                       type: number
 *                       example: 1
 *
 *     responses:
 *       200:
 *         description: Tạo order thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 order_id: "uuid"
 *                 total_amount: 200
 *                 currency: "USDT"
 *                 items:
 *                   - zone_id: "A"
 *                     seat_id: "A1"
 *                     tier_id: "T1"
 *                     quantity: 1
 *                     unit_price: 100
 *
 *       400:
 *         description: Invalid input
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Server error
 *
 *
 *     description: |
 *       ⚠️ API này yêu cầu người dùng phải đăng nhập trước (cookieAuth).
 *       Chỉ user đã login mới có thể truy cập order của mình.
 *       ## Example 1: Zone có seat_map (PHẢI có seat_id)
 *       ```json
 *       {
 *         "concert_id": "11111111-1111-1111-1111-111111111111",
 *         "currency": "USDT",
 *         "items": [
 *           {
 *             "zone_id": "A",
 *             "seat_id": "A1",
 *             "quantity": 1
 *           },
 *           {
 *             "zone_id": "A",
 *             "seat_id": "A2",
 *             "quantity": 1
 *           }
 *         ]
 *       }
 *       ```
 *
 *       ---
 *
 *       ## Example 2: Zone KHÔNG có seat_map (KHÔNG được gửi seat_id)
 *       ```json
 *       {
 *         "concert_id": "11111111-1111-1111-1111-111111111111",
 *         "currency": "USDT",
 *         "items": [
 *           {
 *             "zone_id": "VIP",
 *             "quantity": 2
 *           },
 *           {
 *             "zone_id": "STANDARD",
 *              "seat_id": "A1"
 *             "quantity": 1
 *           }
 *         ]
 *       }
 *       ```
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/helper/authenHelper";
import { createOrder } from "@/app/helper/orderHelper";
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const user_id = decoded.user_id;

    const body = await req.json();
    const { concert_id, items, currency, note } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Items is required" },
        { status: 400 }
      );
    }

    const result = await createOrder({
      user_id,
      concert_id,
      items,
      currency,
      note,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
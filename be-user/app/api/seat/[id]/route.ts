/**
 * @swagger
 * /api/seat/{id}:
 *  post:
 *     summary: Lấy thông tin chi tiết ghế theo seat_id
 *     tags:
 *       - Seat
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - seat_id
 *             properties:
 *               seat_id:
 *                 type: string
 *                 example: "S1"
 *                 description: ID của ghế
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 seat_id: "S1"
 *                 seat_label: "A1"
 *                 row_label: "A"
 *                 seat_number: 1
 *                 status: "AVAILABLE"
 *
 *                 zone_id: "Z1"
 *                 zone_name: "Zone A"
 *
 *                 tier_id: "T1"
 *                 tier_name: "VIP"
 *                 price: 1000000
 *
 *                 locked_at: null
 *                 locked_by_user_id: null
 *                 lock_expires_at: null
 *                 created_at: "2026-04-05T10:00:00Z"
 *
 *       400:
 *         description: Thiếu seat_id
 *       404:
 *         description: Không tìm thấy ghế
 *       500:
 *         description: Lỗi server
 */
import { NextRequest, NextResponse } from "next/server";
import { getSpecificSeat } from "@/app/helper/seatHelper";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { seat_id } = body;

    if (!seat_id) {
      return NextResponse.json(
        { success: false, message: "Missing seat_id" },
        { status: 400 }
      );
    }

    const seat = await getSpecificSeat (seat_id);

    if (!seat) {
      return NextResponse.json(
        { success: false, message: "Seat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: seat
    });

  } catch (error) {
    console.error("API get seat detail error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
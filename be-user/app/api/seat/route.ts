/**
 * @swagger
 * /api/seat:
 *   post:
 *     summary: Lấy danh sách ghế theo concert_id và zone_id
 *     tags:
 *       - Order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             concert_id: "123"
 *             zone_id: "A"
 *     responses:
 *       200:
 *         description: Lấy danh sách ghế thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - seat_id: "1"
 *                   row_label: "A"
 *                   seat_number: 1
 *                   seat_label: "A1"
 *                   status: "AVAILABLE"
 *                   locked_at: null
 *                   locked_by_user_id: null
 *                   lock_expires_at: null
 *                   created_at: "2026-04-05T10:00:00Z"
 *       400:
 *         description: Thiếu concert_id hoặc zone_id
 *       500:
 *         description: Lỗi server
 */

import { NextRequest, NextResponse } from "next/server";
import { getSeats } from "@/app/helper/concertHelper";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concert_id, zone_id } = body;

    if (!concert_id) {
      return NextResponse.json(
        { success: false, message: "Missing concert_id" },
        { status: 400 }
      );
    }
    if (!zone_id) {
      return NextResponse.json(
        { success: false, message: "Missing zone_id" },
        { status: 400 }
      );
    }
    const seats = await getSeats(concert_id, zone_id);

    return NextResponse.json({
      success: true,
      data: seats
    });

  } catch (error) {
    console.error("API seats error:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
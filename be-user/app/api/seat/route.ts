/**
 * @swagger
 * /api/seat:
 *   post:
 *     summary: Lấy danh sách ghế theo zone (đã phân loại theo tier)
 *     description: |
 *       Trả về danh sách ghế được group theo từng loại vé (tier).
 *
 *       ⚠️ Lưu ý:
 *       - Mỗi ghế chỉ thuộc 1 tier (lấy từ seats.tier_id)
 *       - Giá lấy từ seat_tiers.price
 *       - KHÔNG duplicate ghế
 *       - Dữ liệu được group theo tier_name
 *
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
 *               - concert_id
 *               - zone_id
 *             properties:
 *               concert_id:
 *                 type: string
 *                 example: "123"
 *               zone_id:
 *                 type: string
 *                 example: "A"
 *
 *     responses:
 *       200:
 *         description: Lấy danh sách ghế thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: |
 *                     Object với key là tier_name (VIP, NORMAL,...)
 *                     Value là danh sách ghế thuộc tier đó
 *                   additionalProperties:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         seat_id:
 *                           type: string
 *                         seat_label:
 *                           type: string
 *                         row_label:
 *                           type: string
 *                         seat_number:
 *                           type: number
 *                         status:
 *                           type: string
 *                           example: AVAILABLE
 *                         zone_name:
 *                           type: string
 *                         tier_id:
 *                           type: string
 *                         tier_name:
 *                           type: string
 *                         price:
 *                           type: number
 *
 *             example:
 *               success: true
 *               data:
 *                 VIP:
 *                   - seat_id: "S1"
 *                     seat_label: "A1"
 *                     row_label: "A"
 *                     seat_number: 1
 *                     status: "AVAILABLE"
 *                     zone_name: "Zone A"
 *                     tier_id: "T1"
 *                     tier_name: "VIP"
 *                     price: 1000000
 *                   - seat_id: "S2"
 *                     seat_label: "A2"
 *                     row_label: "A"
 *                     seat_number: 2
 *                     status: "BOOKED"
 *                     zone_name: "Zone A"
 *                     tier_id: "T1"
 *                     tier_name: "VIP"
 *                     price: 1000000
 *
 *                 NORMAL:
 *                   - seat_id: "S20"
 *                     seat_label: "B1"
 *                     row_label: "B"
 *                     seat_number: 1
 *                     status: "AVAILABLE"
 *                     zone_name: "Zone A"
 *                     tier_id: "T2"
 *                     tier_name: "NORMAL"
 *                     price: 500000
 *
 *       400:
 *         description: Thiếu concert_id hoặc zone_id
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Missing concert_id or zone_id"
 *
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Server error"
 */
import { NextRequest, NextResponse } from "next/server";
import { getSeatsGroupedByTier } from "@/app/helper/seatHelper";

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

    const data = await getSeatsGroupedByTier(concert_id, zone_id);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error("API seats error:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
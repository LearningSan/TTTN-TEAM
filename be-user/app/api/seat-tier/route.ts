/**
 * @swagger
 * /api/tier-seat:
 *   post:
 *     summary: Lấy danh sách loại vé (seat tiers) theo zone
 *     description: |
 *       Trả về danh sách loại vé (tier) của một zone.
 *
 *       ⚠️ Lưu ý:
 *       - Chỉ áp dụng cho zone có ghế (`has_seat_map = true`)
 *       - Nếu zone là vé đứng (`has_seat_map = false`) → không trả về dữ liệu
 *       - Giá vé nằm trong `seat_tiers.price`
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
 *               - zone_id
 *             properties:
 *               zone_id:
 *                 type: string
 *                 example: "A"
 *
 *     responses:
 *       200:
 *         description: Lấy danh sách tier thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tier_id:
 *                         type: string
 *                       tier_name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       color_code:
 *                         type: string
 *                         nullable: true
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       display_order:
 *                         type: number
 *
 *             example:
 *               success: true
 *               data:
 *                 - tier_id: "T1"
 *                   tier_name: "VIP"
 *                   price: 1000000
 *                   currency: "VND"
 *                   color_code: "#FFD700"
 *                   description: "Ghế VIP gần sân khấu"
 *                   display_order: 1
 *                 - tier_id: "T2"
 *                   tier_name: "NORMAL"
 *                   price: 500000
 *                   currency: "VND"
 *                   color_code: "#00ADEF"
 *                   description: "Ghế thường"
 *                   display_order: 2
 *
 *       400:
 *         description: Thiếu zone_id
 *       404:
 *         description: Zone không tồn tại hoặc không có seat map
 *       500:
 *         description: Lỗi server
 */

import { NextRequest, NextResponse } from "next/server";
import { getSeatTiersByZone } from "@/app/helper/seattierHelper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zone_id } = body;

    if (!zone_id) {
      return NextResponse.json(
        { success: false, message: "Missing zone_id" },
        { status: 400 }
      );
    }

    const tiers = await getSeatTiersByZone(zone_id);

    return NextResponse.json({
      success: true,
      data: tiers
    });

  } catch (error: any) {
    console.error("API tier-seat error:", error);

    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 }
    );
  }
}
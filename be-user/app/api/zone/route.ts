/**
 * @swagger
 * /api/zone:
 *   post:
 *     summary: Lấy danh sách zones theo concert
 *     description: |
 *       Trả về danh sách zone của một concert.
 *       Dựa vào `has_seat_map` để xác định loại zone:
 *       - `true` → Zone có sơ đồ ghế (seat-based)-> Hiển thi giao diện theo zone có sơ đồ ghế, bắt buộc chọn chỗ ngồi khi mua vé
 *       - `false` → Zone dạng đứng (standing) -> Hiển thị giao diện theo zone đứng, không cần chọn chỗ ngồi khi mua vé
 *     
 *     tags:
 *       - Zone
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - concert_id
 *             properties:
 *               concert_id:
 *                 type: string
 *         description: ID của concert cần lấy danh sách zone
 *
 *     responses:
 *       200:
 *         description: Lấy danh sách zones thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       zone_id:
 *                         type: string
 *                       concert_id:
 *                         type: string
 *                       zone_name:
 *                         type: string
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       has_seat_map:
 *                         type: boolean
 *                         description: |
 *                           true = zone có sơ đồ ghế (seat selection required)  
 *                           false = zone đứng (standing zone)
 *                       price:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       total_seats:
 *                         type: number
 *                       available_seats:
 *                         type: number
 *                       sold_seats:
 *                         type: number
 *                       color_code:
 *                         type: string
 *                         nullable: true
 *                       display_order:
 *                         type: number
 *                       status:
 *                         type: string
 *                         example: ACTIVE
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *
 *       400:
 *         description: Thiếu concert_id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: concert_id is required
 *
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */


import { NextRequest, NextResponse } from "next/server";
import { getZones } from "@/app/helper/zoneHelper";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concert_id } = body;
   
    if (!concert_id) {
      return NextResponse.json(
        { success: false, message: "concert_id is required" },
        { status: 400 }
      );
    }

    const zones = await getZones(concert_id);

    return NextResponse.json({
      success: true,
      data: zones
    });

  } catch (error: any) {
    console.error("API /zones error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error"
      },
      { status: 500 }
    );
  }
}
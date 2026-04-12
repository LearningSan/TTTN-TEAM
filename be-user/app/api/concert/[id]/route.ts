/**
 * @swagger
 * /api/concert/{id}:
 *   get:
 *     summary: Lấy chi tiết concert theo ID
 *     description: API trả về thông tin concert kèm danh sách zone và venue
 *     tags:
 *       - Concert
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: ID của concert cần lấy
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
 *                 example: "6d626e3b-2747-4f13-8a35-299729a78d19"
 *     responses:
 *       200:
 *         description: Lấy dữ liệu thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 - concert_id: "abc"
 *                   title: "Live Concert"
 *                   artist: "Sơn Tùng M-TP"
 *                   concert_date: "2026-05-01T20:00:00Z"
 *                   end_date: "2026-05-01T23:00:00Z"
 *                   sale_start_at: "2026-04-01T00:00:00Z"
 *                   sale_end_at: "2026-04-30T23:59:59Z"
 *                   is_on_sale: true
 *                   zone_id: "zone1"
 *                   zone_name: "VIP"
 *                   price: 1500000
 *                   total_seats: 100
 *                   available_seats: 50
 *                   sold_seats: 50
 *                   venue_id: "venue1"
 *                   venue_name: "Sân vận động Mỹ Đình"
 *                   address: "Hà Nội"
 *                   district: "Nam Từ Liêm"
 *                   city: "Hà Nội"
 *                   country: "Việt Nam"
 *       400:
 *         description: Thiếu concert_id
 *       500:
 *         description: Lỗi server
 */
import { NextRequest, NextResponse } from "next/server";
import { getDetail } from "@/app/helper/concertHelper";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: concert_id } = await params; 
    if (!concert_id) throw new Error("concert_id is required");

    const result = await getDetail({ concert_id });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
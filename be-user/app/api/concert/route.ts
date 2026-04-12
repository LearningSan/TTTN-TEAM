/**
 * @swagger
 * /api/concert:
 *   get:
 *     summary: Tìm kiếm danh sách concert
 *     description:  
 *       API hỗ trợ tìm kiếm theo artist, status và phân trang.
 *       Các trường trong request body **không bắt buộc**, nếu không truyền sẽ dùng giá trị mặc định.
 *     tags:
 *       - Concert
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               artist:
 *                 type: string
 *                 example: "Sơn Tùng"
 *               status:
 *                 type: string
 *                 example: "ACTIVE"
 *               page:
 *                 type: integer
 *                 example: 1
 *               pageSize:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Lấy danh sách concert thành công
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
 *         description: Tham số không hợp lệ
 *       500:
 *         description: Lỗi server
 */

import { NextRequest, NextResponse } from "next/server";
import { getAll } from "@/app/helper/concertHelper";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const artist = url.searchParams.get("artist") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const page = url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 1;
    const pageSize = url.searchParams.get("pageSize") ? Number(url.searchParams.get("pageSize")) : 10;

    const result = await getAll({ artist, status, page, pageSize });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
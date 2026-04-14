/**
 * @swagger
 * /api/concert:
 *   get:
 *     summary: Tìm kiếm danh sách concert
 *     description: |
 *       API hỗ trợ tìm kiếm danh sách concert theo các tiêu chí:
 *       - artist: tên nghệ sĩ
 *       - status: trạng thái (ACTIVE, INACTIVE,...)
 *       - phân trang với page và pageSize
 *
 *       ⚠️ Lưu ý:
 *       - Tất cả tham số đều **không bắt buộc**
 *       - Nếu không truyền sẽ dùng giá trị mặc định
 *       - API sử dụng **query params**, không dùng requestBody cho GET
 *
 *     tags:
 *       - Concert
 *
 *     parameters:
 *       - in: query
 *         name: artist
 *         schema:
 *           type: string
 *         required: false
 *         description: Tên nghệ sĩ
 *         example: "Sơn Tùng"
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         required: false
 *         description: Trạng thái concert
 *         example: "ACTIVE"
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: Trang hiện tại (mặc định = 1)
 *         example: 1
 *
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         required: false
 *         description: Số lượng record mỗi trang (mặc định = 10)
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: Lấy danh sách concert thành công
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
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           concert_id:
 *                             type: string
 *                             example: "abc"
 *                           title:
 *                             type: string
 *                             example: "Live Concert"
 *                           artist:
 *                             type: string
 *                             example: "Sơn Tùng M-TP"
 *                           concert_date:
 *                             type: string
 *                             format: date-time
 *                           end_date:
 *                             type: string
 *                             format: date-time
 *                           sale_start_at:
 *                             type: string
 *                             format: date-time
 *                           sale_end_at:
 *                             type: string
 *                             format: date-time
 *                           is_on_sale:
 *                             type: boolean
 *                             example: true
 *
 *                           zone_id:
 *                             type: string
 *                             example: "zone1"
 *                           zone_name:
 *                             type: string
 *                             example: "VIP"
 *                           price:
 *                             type: number
 *                             example: 1500000
 *                           total_seats:
 *                             type: integer
 *                             example: 100
 *                           available_seats:
 *                             type: integer
 *                             example: 50
 *                           sold_seats:
 *                             type: integer
 *                             example: 50
 *
 *                           venue_id:
 *                             type: string
 *                             example: "venue1"
 *                           venue_name:
 *                             type: string
 *                             example: "Sân vận động Mỹ Đình"
 *                           address:
 *                             type: string
 *                             example: "Hà Nội"
 *                           district:
 *                             type: string
 *                             example: "Nam Từ Liêm"
 *                           city:
 *                             type: string
 *                             example: "Hà Nội"
 *                           country:
 *                             type: string
 *                             example: "Việt Nam"
 *
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 10
 *                         totalItems:
 *                           type: integer
 *                           example: 100
 *                         totalPages:
 *                           type: integer
 *                           example: 10
 *
 *       400:
 *         description: Tham số không hợp lệ
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid query parameters"
 *
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Something went wrong"
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
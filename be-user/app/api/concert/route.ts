/**
 * @swagger
 * /api/concert:
 *   get:
 *     summary: Tìm kiếm danh sách concert
 *     description: |
 *       Hỗ trợ tìm kiếm theo:
 *       - title: tên concert
 *       - artist: nghệ sĩ
 *       - city: thành phố
 *       - date: ngày diễn ra
 *       - status: trạng thái
 *       - phân trang
 *
 *     tags:
 *       - Concert
 *
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Tên concert
 *         example: "Live Concert"
 *
 *       - in: query
 *         name: artist
 *         schema:
 *           type: string
 *         description: Nghệ sĩ
 *         example: "Sơn Tùng"
 *
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Thành phố
 *         example: "Hà Nội"
 *
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày diễn ra (YYYY-MM-DD)
 *         example: "2026-05-20"
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Trạng thái
 *         example: "ACTIVE"
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         example: 10
 *
 *     responses:
 *       200:
 *         description: Thành công
 */

import { NextRequest, NextResponse } from "next/server";
import { getAll } from "@/app/helper/concertHelper";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const title = url.searchParams.get("title") || undefined;
    const artist = url.searchParams.get("artist") || undefined;
    const city = url.searchParams.get("city") || undefined;
    const date = url.searchParams.get("date") || undefined;
    const status = url.searchParams.get("status") || undefined;

    const page = url.searchParams.get("page")
      ? Number(url.searchParams.get("page"))
      : 1;

    const pageSize = url.searchParams.get("pageSize")
      ? Number(url.searchParams.get("pageSize"))
      : 10;

    const result = await getAll({
      title,
      artist,
      city,
      date,
      status,
      page,
      pageSize
    });

    return NextResponse.json({ success: true, data: result });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
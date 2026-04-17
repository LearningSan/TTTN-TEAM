/**
 * @swagger
 * /api/concert/search:
 *   get:
 *     summary: Tìm kiếm concert theo keyword (Elasticsearch)
 *     description: |
 *       Tìm kiếm full-text theo:
 *       - title
 *       - artist
 *       - city
 *
 *       Hỗ trợ:
 *       - fuzzy (sai chính tả)
 *       - ranking
 *       - pagination
 *
 *     tags:
 *       - Concert
 *
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         example: "son tung ha noi"
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
import { search } from "@/app/helper/concertHelper";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const keyword = url.searchParams.get("keyword");
    if (!keyword) {
      return NextResponse.json(
        { success: false, message: "Keyword is required" },
        { status: 400 }
      );
    }
const page = Number(url.searchParams.get("page")) || 1;
const pageSize = Number(url.searchParams.get("pageSize")) || 10;

    const result = await search({
      keyword,
      page,
      pageSize
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error("🔥 SEARCH API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Search failed"
      },
      { status: 500 }
    );
  }
}
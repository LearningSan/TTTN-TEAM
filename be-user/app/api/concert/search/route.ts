/**
 * @swagger
 * /api/concert/search:
 *   get:
 *     summary: Tìm kiếm concert (Elasticsearch)
 *     description: |
 *       Tìm kiếm full-text trên nhiều field:
 *       - title
 *       - artist
 *       - description
 *       - venue_name
 *       - city
 *       - district
 *       - address
 *       - organizer_name
 *       - zone_names
 *
 *       Hỗ trợ:
 *       - Fuzzy search
 *       - Ranking (_score)
 *       - Pagination
 *       - Filter (city, status, price, date)
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
 *         example: "son tung ha noi vip"
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         example: 1
 *
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         example: 10
 *
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [COMPLETED, CANCELLED, SOLD_OUT, ON_SALE, DRAFT]
 *
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
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

    const filters = {
      city: url.searchParams.get("city") || undefined,
      status: url.searchParams.get("status") || undefined,
      min_price: url.searchParams.get("min_price")
        ? Number(url.searchParams.get("min_price"))
        : undefined,
      max_price: url.searchParams.get("max_price")
        ? Number(url.searchParams.get("max_price"))
        : undefined,
      date: url.searchParams.get("date") || undefined
    };

    const data = await search(keyword, page, pageSize, filters);

    return NextResponse.json({
      success: true,
      data
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
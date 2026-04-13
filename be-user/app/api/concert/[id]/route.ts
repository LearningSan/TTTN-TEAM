/**
 * @swagger
 * /api/concert/{id}:
 *   post:
 *     summary: Lấy chi tiết concert theo ID
 *     description: |
 *       Trả về thông tin chi tiết concert và venue.
 *
 *       ⚠️ Lưu ý quan trọng:
 *       - API này KHÔNG trả về giá vé
 *       - Để lấy giá vé, cần gọi API `/api/zone`
 *       - Frontend sẽ tự tính giá thấp nhất / cao nhất từ danh sách zones
 *
 *       Luồng chuẩn:
 *       1. Gọi `/api/concert/{id}` để lấy thông tin concert + venue
 *       2. Gọi `/api/zone` để lấy danh sách zone
 *       3. Tự tính giá:
 *          - minPrice = Math.min(...zones.map(z => z.price))
 *          - maxPrice = Math.max(...zones.map(z => z.price))
 *
 *     tags:
 *       - Concert
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
 *                 example: "C1"
 *                 description: ID của concert
 *
 *     responses:
 *       200:
 *         description: Lấy thông tin concert thành công
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
 *                     concert:
 *                       type: object
 *                       properties:
 *                         concert_id:
 *                           type: string
 *                         title:
 *                           type: string
 *                         artist:
 *                           type: string
 *                         concert_date:
 *                           type: string
 *                         end_date:
 *                           type: string
 *                           nullable: true
 *                         description:
 *                           type: string
 *                           nullable: true
 *                         banner_url:
 *                           type: string
 *                           nullable: true
 *                         sale_start_at:
 *                           type: string
 *                           nullable: true
 *                         sale_end_at:
 *                           type: string
 *                           nullable: true
 *                         status:
 *                           type: string
 *                         is_on_sale:
 *                           type: boolean
 *
 *                     venue:
 *                       type: object
 *                       properties:
 *                         venue_id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         address:
 *                           type: string
 *                           nullable: true
 *                         district:
 *                           type: string
 *                           nullable: true
 *                         city:
 *                           type: string
 *                           nullable: true
 *                         country:
 *                           type: string
 *                         capacity:
 *                           type: number
 *
 *       404:
 *         description: Không tìm thấy concert
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
 *                   example: Concert not found
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
import { getDetail } from "@/app/helper/concertHelper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concert_id } = body; 
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
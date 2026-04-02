/**
 * @swagger
 * /api/concert/{id}:
 *   get:
 *     summary: Lấy chi tiết concert
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 1234
 *     responses:
 *       200:
 *         description: OK
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
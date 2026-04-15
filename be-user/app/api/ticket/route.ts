/**
 * @swagger
 * /api/ticket:
 *   post:
 *     summary: Lấy danh sách vé 
 *     tags:
 *       - Tickets
 *     parameters:
 *   
 *     responses:
 *       200:
 *         description: Danh sách vé
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ticket_id:
 *                     type: string
 *                     example: "ticket_123"
 *                   order_id:
 *                     type: string
 *                     example: "order_456"
 *                   user_id:
 *                     type: string
 *                     example: "user_789"
 *                   concert_id:
 *                     type: string
 *                     example: "concert_001"
 *                   seat_id:
 *                     type: string
 *                     example: "seat_01"
 *                   status:
 *                     type: string
 *                     example: "VALID"
 *                   qr_code:
 *                     type: string
 *                     example: "QR123456"
 *                   purchase_date:
 *                     type: string
 *                     format: date-time
 *                     example: "2026-04-08T15:30:00.000Z"
 *       400:
 *         description: order_id không hợp lệ hoặc thiếu
 *       500:
 *         description: Lỗi server
 */

import { NextRequest, NextResponse } from "next/server";
import { getTicketsService } from "@/app/helper/ticketHelper";

export async function POST(req: NextRequest) {
  try {
    

    const tickets = await getTicketsService();

    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
/**
 * @swagger
 * /api/ticket/{id}:
 *   post:
 *     summary: Lấy chi tiết vé theo ticket_id
 *     description: |
 *       API nhận ticket_id qua JSON body để lấy thông tin chi tiết của vé.
 *
 *     tags:
 *       - Tickets
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticket_id
 *             properties:
 *               ticket_id:
 *                 type: string
 *                 example: "TICKET_123456"
 *                 description: ID của vé cần lấy
 *
 *     responses:
 *       200:
 *         description: Lấy thông tin vé thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticket_id:
 *                   type: string
 *                 order_id:
 *                   type: string
 *                 user_id:
 *                   type: string
 *                 concert_id:
 *                   type: string
 *                 zone_id:
 *                   type: string
 *                 seat_id:
 *                   type: string
 *                   nullable: true
 *                 status:
 *                   type: string
 *                   enum:
 *                     - CANCELLED
 *                     - TRANSFERRED
 *                     - USED
 *                     - ACTIVE
 *                     - MINTING
 *                 qr_url:
 *                   type: string
 *
 *       404:
 *         description: Ticket không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ticket not found
 *
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal error
 */

import { NextRequest, NextResponse } from "next/server";
import { getTicketByIdService } from "@/app/helper/ticketHelper";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticket_id } = body;

    const ticket = await getTicketByIdService(ticket_id);

    if (!ticket) {
      return NextResponse.json(
        { message: "Ticket not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
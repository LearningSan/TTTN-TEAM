/**
 * @swagger
 * /api/ticket/{id}:
 *   post:
 *     summary: Lấy chi tiết vé
 *     tags:
 *       - Tickets
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: ID của vé cần lấy
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
/**
 * @swagger
 * /api/resale/list:
 *   post:
 *     summary: Đánh dấu vé để đăng bán (resale listing)
 *     description: |
 *       API dùng để seller đưa vé lên sàn bán lại.
 *
 *       ⚠️ Vé sẽ được chuyển trạng thái:
 *       ACTIVE → TRANSFERRED (đang đăng bán)
 *
 *       Điều kiện:
 *       - User phải là chủ sở hữu vé
 *       - Vé phải ở trạng thái ACTIVE
 *
 *     tags:
 *       - Resale
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
 *                 example: "ticket_123"
 *                 description: ID của vé cần đăng bán
 *
 *     responses:
 *       200:
 *         description: Đăng bán vé thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Ticket listed for resale"
 *
 *       400:
 *         description: Dữ liệu không hợp lệ
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Server error
 */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/data";
import { verifyToken } from "@/app/helper/authenHelper";
import { getTicketForUpdate, markTicketAsTransferred } from "@/app/lib/ticket";
import {
  getConcertById,
  isLessThanOneHour,
  isConcertStarted
} from "@/app/lib/concert";

export async function POST(req: NextRequest) {
  let transaction: any;

  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded?.user_id) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    const { ticket_id } = await req.json();

    if (!ticket_id) {
      return NextResponse.json(
        { message: "ticket_id is required" },
        { status: 400 }
      );
    }

    const pool = await connectDB();
    transaction = pool.transaction();

    await transaction.begin();

    try {
      const timeResult = await transaction.request().query(`
        SELECT GETUTCDATE() AS now
      `);
      const now = new Date(timeResult.recordset[0].now);

      const ticket = await getTicketForUpdate(ticket_id, transaction);

      if (!ticket) {
        await transaction.rollback();
        return NextResponse.json(
          { message: "Ticket not found" },
          { status: 404 }
        );
      }

      if (ticket.status === "TRANSFERRED") {
        await transaction.rollback();
        return NextResponse.json(
          { message: "Ticket already listed for resale" },
          { status: 400 }
        );
      }

      if (ticket.user_id !== decoded.user_id) {
        await transaction.rollback();
        return NextResponse.json(
          { message: "You are not the owner of this ticket" },
          { status: 403 }
        );
      }

      if (ticket.status !== "ACTIVE") {
        await transaction.rollback();
        return NextResponse.json(
          { message: "Ticket cannot be listed for resale" },
          { status: 400 }
        );
      }

      const getConcert = await getConcertById(ticket.concert_id);

      if (!getConcert) {
        await transaction.rollback();
        return NextResponse.json(
          { message: "Concert not found" },
          { status: 404 }
        );
      }

      const concert = getConcert.concert;

      if (isConcertStarted(concert, now)) {
        await transaction.rollback();
        return NextResponse.json(
          { message: "Concert already started or ended" },
          { status: 400 }
        );
      }

      if (isLessThanOneHour(concert, now)) {
        await transaction.rollback();
        return NextResponse.json(
          { message: "Concert less than 1 hour cannot resale" },
          { status: 400 }
        );
      }

      const ok = await markTicketAsTransferred(ticket_id, transaction);

      if (!ok) {
        throw new Error("Failed to update ticket status");
      }

      await transaction.commit();

      return NextResponse.json({
        success: true,
        message: "Ticket listed for resale"
      });

    } catch (err) {
      await transaction.rollback();
      throw err;
    }

  } catch (error: any) {
    console.error("Resale list error:", error);

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

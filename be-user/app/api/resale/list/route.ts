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
import { getTicketForUpdate } from "@/app/lib/ticket";
import { markTicketAsTransferred } from "@/app/lib/ticket";

export async function POST(req: NextRequest) {
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
    const transaction = pool.transaction();

    await transaction.begin();

    try {
      const ticket = await getTicketForUpdate(ticket_id, transaction);

      if (!ticket) {
        throw new Error("Ticket not found");
      }

      if (ticket.user_id !== decoded.user_id) {
        throw new Error("You are not the owner of this ticket");
      }

      if (ticket.status !== "ACTIVE") {
        throw new Error("Ticket cannot be listed for resale");
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
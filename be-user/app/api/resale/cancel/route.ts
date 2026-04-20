/**
 * @swagger
 * /api/resale/cancel:
 *   post:
 *     summary: Hủy đăng bán vé (cancel resale listing)
 *     description: |
 *       API dùng để seller hủy trạng thái đăng bán vé.
 *
 *       ⚠️ Trạng thái sẽ được revert:
 *       TRANSFERRED → ACTIVE
 *
 *       Điều kiện:
 *       - User phải là chủ vé
 *       - Vé đang ở trạng thái TRANSFERRED
 *       - Chưa có giao dịch transfer PENDING
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
 *
 *     responses:
 *       200:
 *         description: Hủy đăng bán thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Resale cancelled"
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/lib/data";
import { verifyToken } from "@/app/helper/authenHelper";
import { getTicketForUpdate } from "@/app/lib/ticket";
import { cancelTicketResale } from "@/app/lib/ticket";
import { checkPendingTransfer } from "@/app/lib/transfer";

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
        throw new Error("Not owner of ticket");
      }

      if (ticket.status !== "TRANSFERRED") {
        throw new Error("Ticket is not in resale state");
      }

      // ❗ không cho hủy nếu đang có người mua
      const isPending = await checkPendingTransfer(ticket_id, transaction);

      if (isPending) {
        throw new Error("Cannot cancel: ticket already in transfer");
      }

      const ok = await cancelTicketResale(ticket_id, transaction);

      if (!ok) {
        throw new Error("Failed to cancel resale");
      }

      await transaction.commit();

      return NextResponse.json({
        success: true,
        message: "Resale cancelled"
      });

    } catch (err) {
      await transaction.rollback();
      throw err;
    }

  } catch (error: any) {
    console.error("Resale cancel error:", error);

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
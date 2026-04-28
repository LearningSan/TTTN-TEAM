/**
 * @swagger
 * /api/resale/check-pending:
 *   post:
 *     summary: Kiểm tra giao dịch transfer pending của 1 vé 
 *     description: >
 *       API trả về bản ghi trong bảng transfer_transactions nếu tồn tại giao dịch
 *       có trạng thái 'PENDING' của vé.
 *       Nếu không có giao dịch nào, trả về null.
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
 *                 example: "abc-123"
 *
 *     responses:
 *       200:
 *         description: Transfer transaction hoặc null
 *         content:
 *           application/json:
 *             schema:
 *               nullable: true
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     transfer_id:
 *                       type: string
 *                       example: "t1"
 *
 *                     ticket_id:
 *                       type: string
 *                       example: "abc-123"
 *
 *                     from_user_id:
 *                       type: string
 *                       example: "user_1"
 *
 *                     to_user_id:
 *                       type: string
 *                       example: "user_2"
 *
 *                     from_wallet:
 *                       type: string
 *                       example: "0xSeller"
 *
 *                     to_wallet:
 *                       type: string
 *                       example: "0xBuyer"
 *
 *                     transaction_hash:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *
 *                     transfer_status:
 *                       type: string
 *                       example: "PENDING"
 *
 *                     transfer_date:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-04-26T18:00:00Z"
 *
 *                     confirmed_at:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       example: null
 *
 *                 - type: "null"
 *
 *       400:
 *         description: ticket_id is required
 *
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Server error
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/helper/authenHelper";
import { checkPendingTransferByTicket } from "@/app/lib/transfer";
import { getTicketById } from "@/app/lib/ticket";
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { ok: false, message: "Invalid token" },
        { status: 401 }
      );
    }

    const { ticket_id } = await req.json();

    if (!ticket_id) {
      return NextResponse.json(
        { ok: false, message: "ticket_id required" },
        { status: 400 }
      );
    }

    const transfer = await checkPendingTransferByTicket(ticket_id);

    if (!transfer?.transfer) {
      return NextResponse.json({
        ok: false,
        message: "No pending transfer"
      });
    }

    const ticket = await getTicketById(ticket_id);

    if (!ticket?.contract_address || !ticket?.token_id) {
      return NextResponse.json({
        ok: false,
        message: "NFT not minted yet"
      });
    }

    return NextResponse.json({
      ok: true,
      transfer: {
        ...transfer.transfer,
        contract_address: ticket.contract_address,
        token_id: ticket.token_id
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    );
  }
}
/**
 * @swagger
 * /api/resale/all-transfers:
 *   get:
 *     summary: Lấy toàn bộ giao dịch resale PENDING
 *     description: >
 *       API trả về tất cả các giao dịch resale có trạng thái 'PENDING'
 *       trong hệ thống (không phụ thuộc user).
 *
 *       ---
 *       🔥 Dùng cho:
 *
 *       - Marketplace (list vé đang có người mua)
 *       - Admin dashboard
 *       - Debug hệ thống resale
 *
 *     tags:
 *       - Resale
 *
 *     responses:
 *       200:
 *         description: Danh sách transfer
 *         content:
 *           application/json:
 *             example:
 *               - transfer_id: "t1"
 *                 ticket_id: "abc-123"
 *                 from_wallet: "0xSeller"
 *                 to_wallet: "0xBuyer"
 *                 token_id: 36
 *                 contract_address: "0xContract"
 *                 transfer_status: "PENDING"
 *                 transfer_date: "2026-04-26T18:00:00Z"
 *
 *       500:
 *         description: Server error
 */

import { NextResponse } from "next/server";
import { getAllPendingTransfers } from "@/app/helper/transferHelper";

export async function GET() {
  try {
    const transfers = await getAllPendingTransfers();

    return NextResponse.json(transfers);

  } catch (error: any) {
    console.error("API all-transfers error:", error);

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
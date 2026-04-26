/**
 * @swagger
 * /api/resale/buy:
 *   post:
 *     summary: Buyer mua lại vé (resale)
 *     description: >
 *       API tạo giao dịch transfer (resale) cho vé.
 *       Sau khi gọi thành công, hệ thống tạo bản ghi trong transfer_transactions với trạng thái PENDING.
 *       FE sử dụng dữ liệu trả về để thực hiện blockchain transfer.
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
 *         description: Tạo giao dịch transfer thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transfer_id:
 *                   type: string
 *                   example: "trans_001"
 *
 *                 price:
 *                   type: number
 *                   example: 150
 *
 *                 from_wallet:
 *                   type: string
 *                   example: "0xSellerWallet"
 *
 *                 to_wallet:
 *                   type: string
 *                   example: "0xBuyerWallet"
 *
 *                 token_id:
 *                   type: string
 *                   example: "123"
 *
 *                 contract_address:
 *                   type: string
 *                   example: "0xContractAddress"
 *
 *       400:
 *         description: ticket_id is required hoặc dữ liệu không hợp lệ
 *
 *       401:
 *         description: Unauthorized (thiếu hoặc sai token)
 *
 *       404:
 *         description: User hoặc Ticket không tồn tại
 *
 *       500:
 *         description: >
 *           Lỗi logic nghiệp vụ:
 *           - Ticket not found
 *           - Cannot buy your own ticket
 *           - Ticket already used
 *           - Ticket not transferred
 *           - Ticket not minted
 *           - Ticket is being transferred
 *           - Buyer not found
 *           - Buyer not active
 *           - Buyer has no wallet
 */

import { NextRequest, NextResponse } from "next/server";
import { createTransferTransaction } from "@/app/helper/transferHelper";
import { getUser } from "@/app/lib/user";
import { verifyToken } from "@/app/helper/authenHelper";
export async function POST(req: NextRequest) {
  try {

    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
   const buyer_id = decoded.user_id; // ✅ không cần query DB

    const user = await getUser(decoded.email);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const body = await req.json();
    const { ticket_id } = body;

    if (!ticket_id) {
      return NextResponse.json(
        { message: "ticket_id is required" },
        { status: 400 }
      );
    }
    const result = await createTransferTransaction(ticket_id, buyer_id);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Resale buy error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
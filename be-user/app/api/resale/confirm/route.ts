/**
 * @swagger
 * /api/resale/confirm:
 *   post:
 *     summary: Xác nhận giao dịch chuyển nhượng vé (resale)
 *     description: |
 *       API này được gọi SAU KHI frontend đã thực hiện transfer NFT trên blockchain.
 *
 *       ---
 *       🔥 **Cách lấy tx_hash (Frontend bắt buộc làm):**
 *
 *       ```javascript
 *       const tx = await contract.transferFrom(from, to, tokenId);
 *       await tx.wait(); // chờ transaction confirm
 *
 *       const tx_hash = tx.hash; // 👈 chính là giá trị cần gửi lên BE
 *       ```
 *
 *       ---
 *       🧠 Flow đầy đủ:
 *
 *       1. Buyer gọi API `/api/resale/buy` → nhận transfer info
 *       2. Seller approve:
 *          `contract.approve(buyer, tokenId)`
 *       3. Buyer gọi:
 *          `contract.transferFrom(from, to, tokenId)`
 *       4. FE lấy:
 *          `tx.hash`
 *       5. Gửi lên API này để BE verify và update DB
 *
 *       ---
 *       ⚠️ Lưu ý:
 *       - Nếu không gửi đúng `tx_hash` → BE sẽ reject
 *       - Transaction phải SUCCESS (status = 1)
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
 *               - transfer_id
 *               - tx_hash
 *             properties:
 *               transfer_id:
 *                 type: string
 *                 example: "5DED1D44-6FD2-4818-AC89-DF153422CDA7"
 *                 description: ID của giao dịch resale trong hệ thống BE
 *
 *               tx_hash:
 *                 type: string
 *                 example: "0x2af0bd760f6a60e7dc3709409a16ec1d46af7da59c831dd9c616a8c5fc4a2c5d"
 *                 description: |
 *                   Hash của transaction blockchain.
 *                   Giá trị này lấy từ `tx.hash` sau khi gọi `transferFrom`.
 *
 *     responses:
 *       200:
 *         description: Confirm thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               transfer_id: "5DED1D44-6FD2-4818-AC89-DF153422CDA7"
 *               tx_hash: "0x2af0bd760f6a60e7dc3709409a16ec1d46af7da59c831dd9c616a8c5fc4a2c5d"
 *
 *       400:
 *         description: Thiếu dữ liệu
 *         content:
 *           application/json:
 *             example:
 *               message: "Missing transfer_id or tx_hash"
 *
 *       500:
 *         description: Xác thực blockchain thất bại
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid NFT transfer"
 */

import { NextRequest, NextResponse } from "next/server";
import { confirmTransferService } from "@/app/helper/transferHelper";
import { verifyToken } from "@/app/helper/authenHelper";
export async function POST(req: NextRequest) {
  try {

     const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - No token" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }
    const { transfer_id, tx_hash } = await req.json();

    if (!transfer_id || !tx_hash) {
      return NextResponse.json(
        { message: "Missing transfer_id or tx_hash" },
        { status: 400 }
      );
    }

    await confirmTransferService(transfer_id, tx_hash);

    return NextResponse.json({ message: "Transfer confirmed" });

  } catch (error: any) {
    console.error("Confirm resale error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
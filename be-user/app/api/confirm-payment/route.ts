/**
 * @swagger
 * /api/confirm-payment:
 *   post:
 *     summary: Xác nhận thanh toán bằng blockchain transaction hash
 *     tags:
 *       - Payment
 *
 *     description: |
 *       ## 🔥 FLOW THANH TOÁN BLOCKCHAIN
 *
 *       Đây là API dùng để xác nhận giao dịch sau khi user thanh toán bằng MetaMask trên Sepolia testnet.
 *
 *       ---
 *
 *       ## 🧪 FLOW TỔNG THỂ
 *
 *       1. FE connect MetaMask
 *       2. User gửi ETH / gọi smart contract mint
 *       3. MetaMask trả về `tx_hash`
 *       4. FE gửi `tx_hash` + `payment_id` về API này
 *       5. Backend verify transaction qua Alchemy RPC
 *       6. Nếu hợp lệ:
 *          - mark payment SUCCESS
 *          - mark order PAID
 *          - mint NFT ticket
 *          - tạo QR code
 *
 *       ---
 *
 *       ## 🧑‍💻 FRONTEND (MetaMask integration)
 *
 *       FE cần làm:
 *
 *       ```js
 *       const accounts = await window.ethereum.request({
 *         method: "eth_requestAccounts"
 *       });
 *
 *       const walletAddress = accounts[0];
 *
 *       const txHash = await window.ethereum.request({
 *         method: "eth_sendTransaction",
 *         params: [{
 *           from: walletAddress,
 *           to: "0xReceiverAddress",
 *           value: "0x0"
 *         }]
 *       });
 *
 *       // gửi về backend
 *       await fetch("/api/confirm-payment", {
 *         method: "POST",
 *         headers: { "Content-Type": "application/json" },
 *         body: JSON.stringify({
 *           payment_id: "xxx",
 *           tx_hash: txHash
 *         })
 *       });
 *       ```
 *
 *       ---
 *
 *       ## 🔗 REQUIREMENTS
 *
 *       - User phải connect MetaMask
 *       - Network: Sepolia testnet
 *       - User phải có ETH từ Sepolia Faucet
 *       - Smart contract đã deploy từ Remix
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_id
 *               - tx_hash
 *             properties:
 *               payment_id:
 *                 type: string
 *                 example: "payment_123"
 *
 *               tx_hash:
 *                 type: string
 *                 example: "0xabc123..."
 *
 *     responses:
 *       200:
 *         description: Thanh toán xác nhận thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               tx_hash: "0xabc123..."
 *               block_number: 12345678
 *               tickets_created: true
 *
 *       400:
 *         description: Thiếu dữ liệu hoặc tx không hợp lệ
 *
 *       500:
 *         description: Lỗi server hoặc blockchain verification failed
 */

import { NextResponse } from "next/server";
import { confirmPaymentService } from "@/app/helper/paymentHelper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payment_id, tx_hash } = body;

    console.log("TX HASH:", tx_hash);
    console.log("PAYMENT:", payment_id);

    if (!payment_id || !tx_hash) {
      return NextResponse.json(
        { message: "payment_id and tx_hash required" },
        { status: 400 }
      );
    }

    const result = await confirmPaymentService(payment_id, tx_hash);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
/**
 * @swagger
 * /api/wallet/verify:
 *   post:
 *     summary: Xác thực chữ ký và lưu địa chỉ ví
 *     tags:
 *       - Wallet
 *
 *     description: |
 *       ## 🔐 VERIFY WALLET (CONNECT WALLET)
 *
 *       API này dùng để:
 *       - Xác thực chữ ký từ MetaMask
 *       - Kiểm tra quyền sở hữu ví
 *       - Lưu địa chỉ ví vào tài khoản
 *
 *       ### Flow:
 *       1. FE gửi wallet_address + signature + message
 *       2. Backend verify chữ ký bằng ethers
 *       3. Kiểm tra ví đã tồn tại chưa
 *       4. Lưu vào DB nếu hợp lệ
 *
 *       ⚠️ Chỉ lưu ví khi signature hợp lệ
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             wallet_address: "0xAbc1234567890abcdef1234567890ABCDEF1234"
 *             signature: "0x..."
 *             message: "Sign this message to connect wallet. Nonce: 123456"
 *
 *     responses:
 *       200:
 *         description: Kết nối ví thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Wallet connected successfully"
 *
 *       400:
 *         description: Dữ liệu không hợp lệ / chữ ký sai / ví đã tồn tại
 *         content:
 *           application/json:
 *             examples:
 *               missing_data:
 *                 summary: Thiếu dữ liệu
 *                 value:
 *                   message: "Missing data"
 *
 *               invalid_wallet:
 *                 summary: Sai định dạng ví
 *                 value:
 *                   message: "Invalid wallet address format"
 *
 *               invalid_signature:
 *                 summary: Chữ ký không hợp lệ
 *                 value:
 *                   message: "Invalid signature"
 *
 *               wallet_used:
 *                 summary: Ví đã được sử dụng
 *                 value:
 *                   message: "Wallet already in use"
 *
 *       401:
 *         description: Không có token hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 *
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal server error"
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/helper/authenHelper";
import { ethers } from "ethers";
import { 
  updateWalletAddress,
  getUserByWalletAddress 
} from "@/app/lib/user";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const user_id = decoded.user_id;

    const body = await req.json();
    let { wallet_address, signature, message } = body;

    if (!wallet_address || !signature || !message) {
      return NextResponse.json(
        { message: "Missing data" },
        { status: 400 }
      );
    }
     if (!wallet_address) {
      return NextResponse.json(
        { message: "wallet_address is required" },
        { status: 400 }
      );
    }

    try {
      wallet_address = ethers.getAddress(wallet_address); 
    } catch {
      return NextResponse.json(
        { message: "Invalid wallet address format" },
        { status: 400 }
      );
    }
    const signerAddress = ethers.verifyMessage(message, signature);

    if (signerAddress.toLowerCase() !== wallet_address.toLowerCase()) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 }
      );
    }

    const existingWallet = await getUserByWalletAddress(wallet_address);

    if (existingWallet && existingWallet.user_id !== user_id) {
      return NextResponse.json(
        { message: "Wallet already in use" },
        { status: 400 }
      );
    }

    await updateWalletAddress(user_id, wallet_address);

    return NextResponse.json({
      success: true,
      message: "Wallet connected successfully",
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
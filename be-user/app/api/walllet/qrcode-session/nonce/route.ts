/**
 * @swagger
 * /api/wallet/nonce:
 *   get:
 *     summary: Tạo message (nonce) để ký xác thực ví
 *     tags:
 *       - Wallet
 *
 *     description: |
 *       ## 🔐 GET NONCE (SIGN MESSAGE)
 *
 *       API này dùng để tạo message (challenge) cho người dùng ký bằng MetaMask.
 *
 *       ### Flow:
 *       1. FE gọi API này sau khi lấy được wallet_address từ MetaMask
 *       2. Backend tạo message chứa nonce
 *       3. FE dùng message này để yêu cầu user ký (personal_sign)
 *
 *       ⚠️ Không lưu ví ở bước này
 *
 *     responses:
 *       200:
 *         description: Tạo message thành công
 *         content:
 *           application/json:
 *             example:
 *               message: "Sign this message to connect wallet. Nonce: 123456"
 *               nonce: 123456
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
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const nonce = Math.floor(Math.random() * 1000000);

    const message = `Sign this message to connect wallet. Nonce: ${nonce}`;

    return NextResponse.json({
      message,
      nonce
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
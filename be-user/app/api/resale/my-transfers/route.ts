/**
 * @swagger
 * /api/resale/my-transfers:
 *   get:
 *     summary: Lấy danh sách người đang mua vé của seller
 *     description: >
 *       API trả về danh sách các giao dịch resale có trạng thái 'PENDING'
 *       mà user hiện tại là người bán (seller).
 *
 *       ---
 *       🔥 **Cách dùng cho FE:**
 *
 *       - FE gọi API này để lấy danh sách người đang muốn mua vé
 *       - Nếu có dữ liệu → hiển thị UI approve
 *       - Nếu rỗng → chưa có ai mua
 *
 *       ---
 *       🎯 **Flow:**
 *
 *       1. Buyer bấm mua → tạo transfer (PENDING)
 *       2. Seller gọi API này
 *       3. Hiển thị danh sách buyer
 *       4. Seller approve NFT
 *
 *       ---
 *       ⚠️ Lưu ý:
 *
 *       - Chỉ trả về transfer_status = 'PENDING'
 *       - Dùng cho SELLER (from_wallet)
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
 *       401:
 *         description: Unauthorized
 *
 *       500:
 *         description: Server error
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/helper/authenHelper";
import { getUser } from "@/app/lib/user";
import { getMyPendingTransfers } from "@/app/helper/transferHelper";

export async function GET(req: NextRequest) {
  try {

    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded?.email) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    const user = await getUser(decoded.email);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
    if (!user.wallet_address) {
  return NextResponse.json(
    { message: "User has no wallet" },
    { status: 400 }
  );
}

    const transfers = await getMyPendingTransfers(user.wallet_address);

    return NextResponse.json(transfers);

  } catch (error: any) {
    console.error("API my-transfers error:", error);

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
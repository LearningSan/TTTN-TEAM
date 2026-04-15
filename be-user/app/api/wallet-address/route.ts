import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/helper/authenHelper";
import { updateWalletAddress } from "@/app/lib/user";

export async function POST(req: NextRequest) {
  try {
    // 1. lấy token từ cookie
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. verify token
    const decoded: any = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: "Invalid token" },
        { status: 401 }
      );
    }

    const user_id = decoded.user_id;

    // 3. body
    const body = await req.json();
    const { wallet_address } = body;

    if (!wallet_address) {
      return NextResponse.json(
        { message: "wallet_address is required" },
        { status: 400 }
      );
    }

    // 4. update DB
    await updateWalletAddress(user_id, wallet_address);

    return NextResponse.json({
      success: true,
      message: "Wallet updated successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { deleteToken } from "@/app/helper/authenHelper";
export async function POST(req: NextRequest) {
  try {
  const refreshToken = req.cookies.get("refresh_token")?.value;

    if (refreshToken) {
      await deleteToken(refreshToken); // xóa trong DB
    }

    const res = NextResponse.json({ message: "Logged out" });
   res.cookies.set("access_token", "", { path: "/", httpOnly: true, maxAge: 0 });
    res.cookies.set("refresh_token", "", { path: "/", httpOnly: true, maxAge: 0 });
    return res;
  } catch (err) {
    return NextResponse.json(
      { message: "Logout failed" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { resetPassword } from "@/app/helper/passwordHelper";

export async function POST(req: NextRequest) {
  try {
    const { email,newPassword } = await req.json();

    if (!email  || !newPassword) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    const result = await resetPassword(email, newPassword);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("API reset password error:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
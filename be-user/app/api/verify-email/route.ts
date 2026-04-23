import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/app/helper/emailVerificationHelper";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { message: "Token is required" },
        { status: 400 }
      );
    }

    const result = await verifyEmailToken(token);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Verify email failed:", error);
    return NextResponse.json(
      { message: "Verify email failed" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { verifyEmailToken } from "@/app/helper/emailVerificationHelper";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        "http://localhost:5173/login?error=missing_token"
      );
    }

    const result = await verifyEmailToken(token);

    if (!result.success) {
      return NextResponse.redirect(
        `http://localhost:5173/login?error=${encodeURIComponent(result.message)}`
      );
    }

    return NextResponse.redirect(
      "http://localhost:5173/login?verified=true"
    );

  } catch (error) {
    console.error("Verify email failed:", error);

    return NextResponse.redirect(
      "http://localhost:5173/login?error=server_error"
    );
  }
}
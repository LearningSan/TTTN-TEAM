import { NextRequest,NextResponse } from "next/server";
import { verifyOTP } from "@/app/helper/passwordHelper";
export async function POST(req: NextRequest) {
  try {
    let { email, otp } = await req.json();

    const result = await verifyOTP(email, otp);

    return NextResponse.json(result);

  } catch (error) {
    console.error("Failed to verify", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
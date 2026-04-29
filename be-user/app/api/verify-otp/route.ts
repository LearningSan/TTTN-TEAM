/**
 * @swagger
 * /api/verify-otp:
 *   post:
 *     summary: Xác thực OTP
 *     tags:
 *       - ForgotPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: admin@gmail.com
 *             otp: 123456
 *     responses:
 *       200:
 *         description: OK
 */


import { NextRequest, NextResponse } from "next/server";
import { verifyOTP } from "@/app/helper/passwordHelper";
import { otpLimiter } from "@/app/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    const key = `${ip}-${email}`;

    const { success, limit, remaining, reset } =
      await otpLimiter.limit(key);

    if (!success) {
      return NextResponse.json(
        { message: "Too many OTP attempts" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return NextResponse.json(
        { message: "Invalid OTP format" },
        { status: 400 }
      );
    }

    const result = await verifyOTP(email, otp);

    if (!result?.success) {
      await new Promise((r) => setTimeout(r, 300));
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Failed to verify", error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
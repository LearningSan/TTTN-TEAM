/**
 * @swagger
 * /api/forgot-password:
 *   post:
 *     summary: Gửi OTP về email
 *     tags:
 *       - ForgotPassword
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: admin@gmail.com
 *     responses:
 *       200:
 *         description: OK
 */

import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/app/helper/passwordHelper";
import { forgotPasswordLimiter } from "@/app/lib/ratelimit";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    const key = `${ip}-${email}`;

    const { success, limit, remaining, reset } =
      await forgotPasswordLimiter.limit(key);

    if (!success) {
      return NextResponse.json(
        { message: "Too many requests" },
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

    const result = await sendMail(email);

    await new Promise((r) => setTimeout(r, 300));

    return NextResponse.json({
      message: "If the email exists, an OTP has been sent",
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
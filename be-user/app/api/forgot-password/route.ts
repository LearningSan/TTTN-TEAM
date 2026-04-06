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

import { NextRequest,NextResponse } from "next/server";
import { sendMail } from "@/app/helper/passwordHelper";
export async function POST(req:NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    const result = await sendMail(email);

    return NextResponse.json(result);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }    
}
/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Đăng ký tài khoản
 *     description: |
 *       Tạo tài khoản mới và gửi email xác thực
 *
 *       ⚠️ Lưu ý:
 *       - Trường `wallet_address` ban đầu sẽ NULL
 *       - Mỗi user có thể cập nhật wallet sau
 *       - Wallet address phải là duy nhất (nếu tồn tại)
 *     tags:
 *       - Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@gmail.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "Abc12345"
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Try It"
 *               phone:
 *                 type: string
 *                 nullable: true
 *                 description: Số điện thoại Việt Nam (bắt đầu bằng 0, 10-11 số)
 *                 example: "0912345678"
 *     responses:
 *       200:
 *         description: Đăng ký thành công, cần verify email
 *         content:
 *           application/json:
 *             example:
 *               message: Register success. Please verify your email
 *               user:
 *                 user_id: 1
 *                 email: admin@gmail.com
 *                 name: Try It
 *                 phone: "0912345678"
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc user đã tồn tại
 *         content:
 *           application/json:
 *             example:
 *               message: Invalid input
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             example:
 *               message: Failed to create user
 */

import { NextRequest, NextResponse } from "next/server";
import { createUser } from "@/app/lib/user";
import { sanitizeUser } from "@/app/helper/authenHelper";
import { createEmailVerification } from "@/app/lib/email_verification";
import { sendVerifyEmail } from "@/app/helper/emailVerificationHelper";
import { signupLimiter } from "@/app/lib/ratelimit";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { email, password, phone, name } = body;

    // ===== Trim =====
    email = email?.trim();
    name = name?.trim();

    // ===== Validate rỗng =====
    if (!email || !password || !name) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // ===== Validate email =====
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // ===== Validate password =====
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          message:
            "Password must be at least 8 characters and include uppercase, lowercase, and number",
        },
        { status: 400 }
      );
    }

    // ===== Validate name =====
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { message: "Name must be between 2 and 50 characters" },
        { status: 400 }
      );
    }

    // ===== Validate phone =====
    if (phone) {
      const phoneRegex = /^0\d{9,10}$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json(
          { message: "Invalid phone number format" },
          { status: 400 }
        );
      }
    }

    // 🔥 Lấy IP chuẩn
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // 🔥 Key: IP + email (quan trọng)
    const key = `${ip}-${email}`;

    const { success, limit, remaining, reset } =
      await signupLimiter.limit(key);

    if (!success) {
      return NextResponse.json(
        { message: "Too many signup attempts" },
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

    // ===== Create user =====
    const newUser = await createUser(email, password, name, phone);

    if (!newUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // ===== Tạo OTP email =====
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await createEmailVerification(newUser.user_id, token, expires);
    await sendVerifyEmail(email, token);

    return NextResponse.json({
      message: "Register success. Please verify your email",
      user: await sanitizeUser(newUser),
    });

  } catch (error) {
    console.error("Failed to create user", error);

    return NextResponse.json(
      { message: "Failed to create user" },
      { status: 500 }
    );
  }
}
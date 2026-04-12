/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Đăng nhập bằng email và password
 *     description: API dùng để xác thực người dùng và trả về accessToken + refreshToken (qua cookies)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@gmail.com
 *                 description: Email hợp lệ của người dùng
 *               password:
 *                 type: string
 *                 example: "123456"
 *                 description: Mật khẩu (ít nhất 6 ký tự)
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             example:
 *               user_id: 1
 *               name: "Admin"
 *               email: "admin@gmail.com"
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid input"
 *       401:
 *         description: Sai email hoặc password
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid email or password"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             example:
 *               message: "Token creation failed"
 */

import { NextRequest,NextResponse } from "next/server";
import { setCookies } from "@/app/helper/authenHelper";
import { authenticateUser,createToken } from "@/app/helper/authenHelper";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
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

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    return NextResponse.json(
      { message: "Password must include uppercase, lowercase, and number" },
      { status: 400 }
    );
  }

  const user = await authenticateUser(email, password);

  if (!user) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  }

  let { user_id, name } = user;
  const tokenData = await createToken({ user_id, email, name });

  if (!tokenData) {
    return NextResponse.json(
      { message: "Token creation failed" },
      { status: 500 }
    );
  }

  const { accessToken, refreshToken } = tokenData;

  const response = NextResponse.json(user);
  await setCookies(response, accessToken, refreshToken);

  return response;
}
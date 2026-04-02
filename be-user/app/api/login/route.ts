/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Đăng nhập bằng email + password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: admin@gmail.com
 *             password: 123456
 *     responses:
 *       200:
 *         description: OK
 */

import { NextRequest,NextResponse } from "next/server";
import { setCookies } from "@/app/helper/authenHelper";
import { authenticateUser,createToken } from "@/app/helper/authenHelper";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  const user = await authenticateUser(email, password);

  if (!user) {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }
let {user_id,name}=user
const tokenData = await createToken({user_id,email,name});

if (!tokenData) {
  return NextResponse.json(
    { message: "Token creation failed" },
    { status: 500 }
  );
}
const { accessToken, refreshToken } = tokenData;
 
  const response = NextResponse.json(
    user,
  );
   await setCookies(response,accessToken,refreshToken)

  return response;
}

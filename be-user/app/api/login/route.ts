import { NextRequest,NextResponse } from "next/server";

import { authenticateUser,createToken } from "@/app/helper/authenHelper";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  const user = await authenticateUser(email, password);

  if (!user) {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }

const tokenData = await createToken(user);

if (!tokenData) {
  return NextResponse.json(
    { message: "Token creation failed" },
    { status: 500 }
  );
}
const { accessToken, refreshToken } = tokenData;
 
  const response = NextResponse.json({
    message: "Login success",
    user,
  });
    response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: false, // nên true nếu HTTPS
    sameSite: "strict",
    maxAge: 60 * 60 // 1 giờ
  });
  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 
  });

  return response;
}

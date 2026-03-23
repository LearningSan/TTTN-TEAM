import { NextRequest,NextResponse } from "next/server";

import { authenticateUser,createToken } from "@/app/helper/authenHelper";
export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  const user = await authenticateUser(email, password);

  if (!user) {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }

  const token =await createToken(user);

  return NextResponse.json({
    message: "Login success",
    user,
    token,
  });
}
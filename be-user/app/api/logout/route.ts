import { NextRequest, NextResponse } from "next/server";
import { deleteToken } from "@/app/helper/authenHelper";
export async function POST(req: NextRequest) {
  const {refresh_token} =await req.json();
  if(refresh_token) 
 deleteToken(refresh_token)
const res = NextResponse.json({ message: "Logged out" });

  res.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return res;
}
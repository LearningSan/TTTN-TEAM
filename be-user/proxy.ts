import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./app/helper/authenHelper";
export default function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  const user = token ? verifyToken(token) : null;

  const onDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (onDashboard && !user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (!onDashboard && user) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
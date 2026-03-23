import { NextRequest, NextResponse } from "next/server";
import { verifyToken,refreshToken } from "./app/helper/authenHelper";
export  default async function middleware(req: NextRequest) {
  let token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  let user = token ?await verifyToken(token) : null;
 if (!user && token) {
    try {
      const newToken = await refreshToken(token); 
      if (newToken) {
        token = newToken;

        const res = NextResponse.next();
        res.cookies.set("token", newToken, { httpOnly: true, path: "/" });
        user = await verifyToken(newToken); 
        return res;
      }
    } catch (err) {
      console.log("Refresh token failed:", err);
    }
  }
  const onDashboard =await req.nextUrl.pathname.startsWith("/dashboard");
 
  if (onDashboard && !user) {
    return await NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (!onDashboard && user) {
    return await NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return await NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
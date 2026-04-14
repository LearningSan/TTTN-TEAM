import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  refreshAccessToken,
  refreshRefreshToken,
} from "./app/helper/authenHelper";
const isProd = process.env.NODE_ENV === "production";
async function handleTokens(accessToken?: string, refreshToken?: string) {
  let user: any = null;
  let newAccessToken: string | null = null;
  let newRefreshToken: string | null = null;

  if (accessToken) {
    try {
      user = await verifyToken(accessToken);
      return { user, newAccessToken, newRefreshToken };
    } catch (err: any) {
      if (err.name !== "TokenExpiredError") {
        return { user: null, newAccessToken: null, newRefreshToken: null };
      }
    }
  }

  if (refreshToken) {
    try {
      const tokens = await refreshRefreshToken(refreshToken);
      newAccessToken = tokens.accessToken;
      newRefreshToken = tokens.refreshToken;

      user = await verifyToken(newAccessToken);

      return { user, newAccessToken, newRefreshToken };
    } catch (err) {
      console.log("Refresh token invalid:", err);
      return { user: null, newAccessToken: null, newRefreshToken: null };
    }
  }

  return { user: null, newAccessToken: null, newRefreshToken: null };
}

export default async function middleware(req: NextRequest) {
  // ===== CORS =====
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  const { user, newAccessToken, newRefreshToken } = await handleTokens(
    accessToken,
    refreshToken,
  );

  const res = NextResponse.next();

  res.headers.set("Access-Control-Allow-Origin", "http://localhost:5173");
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS",
  );
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");

  // ===== set cookie mới nếu có =====
  const isProd = process.env.NODE_ENV === "production";

  if (newAccessToken) {
    res.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 15 * 60,
      sameSite: "none",
      secure: isProd,
    });
  }

  if (newRefreshToken) {
    res.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "none",
      secure: isProd,
    });
  }

  const isProtected = req.nextUrl.pathname.startsWith("/dashboard");

  if (isProtected && !user) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$).*)"],
};

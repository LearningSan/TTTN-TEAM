import { NextRequest, NextResponse } from "next/server";
import {
  verifyToken,
  refreshRefreshToken,
} from "./app/helper/authenHelper";

async function handleTokens(
  accessToken?: string,
  refreshToken?: string
) {
  let user: any = null;
  let newAccessToken: string | null = null;
  let newRefreshToken: string | null = null;

  // verify access token
  if (accessToken) {
    try {
      user = await verifyToken(accessToken);
      return { user, newAccessToken, newRefreshToken };
    } catch (err: any) {
      if (err.name !== "TokenExpiredError") {
        return { user: null, newAccessToken, newRefreshToken };
      }
    }
  }

  // refresh token
  if (refreshToken) {
    try {
      const tokens = await refreshRefreshToken(refreshToken);
      newAccessToken = tokens.accessToken;
      newRefreshToken = tokens.refreshToken;

      user = await verifyToken(newAccessToken);

      return { user, newAccessToken, newRefreshToken };
    } catch (err) {
      console.log("Refresh token invalid:", err);
      return { user: null, newAccessToken, newRefreshToken };
    }
  }

  return { user: null, newAccessToken, newRefreshToken };
}

export default async function middleware(req: NextRequest) {
  const allowedOrigin = "http://localhost:5173";

  // ===== CORS preflight =====
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  const res = NextResponse.next();

  // ===== CORS =====
  res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // ===== chỉ auth route cần bảo vệ =====
  const isProtected = req.nextUrl.pathname.startsWith("/dashboard");

  let user: any = null;
  let newAccessToken: string | null = null;
  let newRefreshToken: string | null = null;

  if (isProtected) {
    const accessToken = req.cookies.get("access_token")?.value;
    const refreshToken = req.cookies.get("refresh_token")?.value;

    const result = await handleTokens(accessToken, refreshToken);

    user = result.user;
    newAccessToken = result.newAccessToken;
    newRefreshToken = result.newRefreshToken;
  }

  // ===== COOKIE (fix local) =====
  if (newAccessToken) {
    res.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 15 * 60,
      sameSite: "lax", // 🔥 local phải dùng cái này
      secure: false,   // 🔥 không dùng https thì phải false
    });
  }

  if (newRefreshToken) {
    res.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
      secure: false,
    });
  }

  // ===== block nếu chưa login =====
  if (isProtected && !user) {
    return new NextResponse(
      JSON.stringify({ message: "Unauthorized" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  }

  return res;
}

// áp dụng cho toàn bộ (kể cả API)
export const config = {
  matcher: ["/:path*"],
};
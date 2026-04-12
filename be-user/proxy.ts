import { NextRequest, NextResponse } from "next/server";
import { verifyToken, refreshAccessToken, refreshRefreshToken } from "./app/helper/authenHelper";

async function handleTokens(accessToken?: string, refreshToken?: string) {
  let user: any = null;
  let newAccessToken: string | null = null;
  let newRefreshToken: string | null = null;

  if (accessToken) {
    try {
      user = await verifyToken(accessToken);
      return { user, newAccessToken, newRefreshToken };
    } catch (err) {
      console.log("Access token expired:", err);
    }
  }

  if (refreshToken) {
    try {
      newAccessToken = await refreshAccessToken(refreshToken);
      user = await verifyToken(newAccessToken);
      return { user, newAccessToken, newRefreshToken }; // chỉ reset access token
    } catch (errAccess) {
      console.log("Cannot refresh access token:", errAccess);

      try {
        const tokens = await refreshRefreshToken(refreshToken);
        newAccessToken = tokens.accessToken;
        newRefreshToken = tokens.refreshToken;
        user = await verifyToken(newAccessToken);
        return { user, newAccessToken, newRefreshToken }; // reset cả access + refresh token
      } catch (errRefresh) {
        console.log("Refresh token invalid or expired:", errRefresh);
        return { user: null, newAccessToken: null, newRefreshToken: null }; // user phải login lại
      }
    }
  }

  return { user: null, newAccessToken: null, newRefreshToken: null };
}

export default async function middleware(req: NextRequest) {
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

  const { user, newAccessToken, newRefreshToken } = await handleTokens(accessToken, refreshToken);

  const res = NextResponse.next();
 res.headers.set("Access-Control-Allow-Origin", "http://localhost:5173");
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");

  if (newAccessToken) {
    res.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60, // 1 giờ
    });
  }
  if (newRefreshToken) {
    res.cookies.set("refresh_token", newRefreshToken, {
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 ngày
    });
  }

//   const onDashboard = req.nextUrl.pathname.startsWith("/dashboard");

//   if (onDashboard && !user) {
//   return NextResponse.redirect(new URL("/login", req.url));
// }

// if (!onDashboard && user) {
//   return NextResponse.redirect(new URL("/swagger", req.url));
// }
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, refreshAccessToken, refreshRefreshToken } from "./app/helper/authenHelper";

// Helper function xử lý token
async function handleTokens(accessToken?: string, refreshToken?: string) {
  let user: any = null;
  let newAccessToken: string | null = null;
  let newRefreshToken: string | null = null;

  // 1️⃣ Thử verify access token
  if (accessToken) {
    try {
      user = await verifyToken(accessToken);
      return { user, newAccessToken, newRefreshToken };
    } catch (err) {
      console.log("Access token expired:", err);
      // Access token hết hạn → tiếp tục
    }
  }

  // 2️⃣ Nếu refresh token còn hạn → tạo access token mới
  if (refreshToken) {
    try {
      newAccessToken = await refreshAccessToken(refreshToken);
      user = await verifyToken(newAccessToken);
      return { user, newAccessToken, newRefreshToken }; // chỉ reset access token
    } catch (errAccess) {
      console.log("Cannot refresh access token:", errAccess);

      // 3️⃣ Nếu refresh access token fail → thử refresh refresh token
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

  // Không có token hợp lệ
  return { user: null, newAccessToken: null, newRefreshToken: null };
}

export default async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("access_token")?.value;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  const { user, newAccessToken, newRefreshToken } = await handleTokens(accessToken, refreshToken);

  const res = NextResponse.next();

  // 4️⃣ Set lại cookie nếu có token mới
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

  const onDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  if (onDashboard && !user) {
  return NextResponse.redirect(new URL("/login", req.url));
}

if (!onDashboard && user) {
  return NextResponse.redirect(new URL("/dashboard", req.url));
}
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
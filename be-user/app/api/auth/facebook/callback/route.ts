import { NextRequest, NextResponse } from "next/server";
import { FacebookLogin } from "@/app/helper/authenHelper";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ message: "No code" }, { status: 400 });
  }

  let result;
  try {
    result = await FacebookLogin(code);
    console.log("FacebookLogin result:", result);
  } catch (err) {
    console.error("FacebookLogin failed:", err);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }

  const { accessToken, refreshToken, user } = result;

  const response = NextResponse.json({ user });

  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: false, // nên true nếu deploy HTTPS
    sameSite: "strict",
    maxAge: 60 * 60, // 1 giờ
  });

  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60, // 7 ngày
  });

return new Response(`
  <script>
    if (window.opener) {
      window.opener.postMessage("LOGIN_SUCCESS", "*");
      window.close();
    } else {
      // fallback nếu không có opener
      window.location.href = "http://localhost:3000/login?error=no_opener";
    }
  </script>
`, {
  headers: { "Content-Type": "text/html" }
});
}
import { NextRequest, NextResponse } from "next/server";
import { FacebookLogin } from "@/app/helper/authenHelper";
import { setCookies } from "@/app/helper/authenHelper";
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ message: "No code" }, { status: 400 });
  }

  let result;
  try {
    result = await FacebookLogin(code);
  } catch (err) {
    console.error("FacebookLogin failed:", err);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }

  const { accessToken, refreshToken } = result;

 const response = new NextResponse(`
  <script>
    if (window.opener) {
      window.opener.postMessage("LOGIN_SUCCESS", "*");
      window.close();
    } else {
      window.location.href = "http://localhost:3000/login?error=no_opener";
    }
  </script>
`, {
  headers: { "Content-Type": "text/html" }
});

await setCookies(response, accessToken, refreshToken);

return response;
}
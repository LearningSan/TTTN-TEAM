/**
 * @swagger
 * /api/auth/facebook:
 *   get:
 *     summary: Login Facebook
 *     responses:
 *       200:
 *         description: OK
 */
import { NextResponse } from "next/server";

export async function GET() {
const url = "https://www.facebook.com/v18.0/dialog/oauth?"+
 new URLSearchParams({
  client_id: process.env.FACEBOOK_APP_ID!,
  redirect_uri: process.env.FACEBOOK_REDIRECT_URI!,
  response_type: "code",
  scope: "email,public_profile"
});

return NextResponse.redirect(url)
}
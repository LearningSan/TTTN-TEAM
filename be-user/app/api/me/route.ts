/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Lấy thông tin user hiện tại
 *     responses:
 *       200:
 *         description: OK
 */


import { NextRequest, NextResponse } from "next/server";
import { verifyToken, sanitizeUser } from "@/app/helper/authenHelper";
import { getUser } from "@/app/lib/user";
import { userLimiter } from "@/app/lib/ratelimit";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    let key = ip; // default

    if (token) {
      const decoded = await verifyToken(token);

      if (decoded?.user_id) {
        key = `user-${decoded.user_id}`; 
      }
    }

    const { success, limit, remaining, reset } =
      await userLimiter.limit(key);

    if (!success) {
      return NextResponse.json(
        { message: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ user: null });
    }

    const userFromDb = await getUser(user.email);

    if (!userFromDb) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json(await sanitizeUser(userFromDb));

  } catch (err) {
    console.error("GET /api/me error:", err);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
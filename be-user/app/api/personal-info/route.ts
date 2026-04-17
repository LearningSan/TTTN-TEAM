/**
 * @swagger
 * /api/personal-info:
 *   get:
 *     summary: Lấy thông tin cá nhân của user
 *     tags:
 *       - User
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lấy thông tin thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 name: "Nguyen Van A"
 *                 email: "a@gmail.com"
 *                 phone: "0123456789"
 *                 avatar_url: "https://example.com/avatar.png"
 *       401:
 *         description: Unauthorized hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 *       404:
 *         description: Không tìm thấy user
 *         content:
 *           application/json:
 *             example:
 *               message: "User not found"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             example:
 *               message: "Get personal info failed"
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/helper/authenHelper";
import { getUser } from "@/app/lib/user";
import { sanitizeUser } from "@/app/helper/authenHelper";
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("access_token")?.value;
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const user = await getUser(decoded.email);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        return NextResponse.json({
            success: true,
            data: await sanitizeUser(user)
        });
    } catch (error) {
        console.error("Get personal info failed:", error);
        return NextResponse.json(
            { message: "Get personal info failed" },
            { status: 500 }
        );
    }
}
/**
 * @swagger
 * /api/personal-info/update:
 *   post:
 *     summary: Cập nhật thông tin cá nhân
 *     tags:
 *       - User
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "Nguyen Van A"
 *             phone: "0123456789"
 *             avatar_url: "https://example.com/avatar.png"
 *             email: "a@gmail.com"
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Cập nhật thông tin thành công"
 *       401:
 *         description: Unauthorized hoặc token không hợp lệ
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized"
 *       404:
 *         description: Không tìm thấy user để cập nhật
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Không tìm thấy user để cập nhật"
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
import { updatePersonalInfo } from "@/app/lib/user";
export async function POST(req: NextRequest) {
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
        const body = await req.json();
        const { name, phone, avatar_url, email } = body;
        if (name !== undefined) {
            if (typeof name !== "string" || name.trim().length < 2) {
                return NextResponse.json(
                    { message: "Tên không hợp lệ (>= 2 ký tự)" },
                    { status: 400 }
                );
            }
        }

        if (phone !== undefined) {
            const phoneRegex = /^(0|\+84)[0-9]{9}$/;
            if (typeof phone !== "string" || !phoneRegex.test(phone)) {
                return NextResponse.json(
                    { message: "Số điện thoại không hợp lệ" },
                    { status: 400 }
                );
            }
        }

        if (avatar_url !== undefined) {
            try {
                new URL(avatar_url);
            } catch {
                return NextResponse.json(
                    { message: "Avatar URL không hợp lệ" },
                    { status: 400 }
                );
            }
        }

        if (email !== undefined) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (typeof email !== "string" || !emailRegex.test(email)) {
                return NextResponse.json(
                    { message: "Email không hợp lệ" },
                    { status: 400 }
                );
            }
        }
        const result = await updatePersonalInfo(name, phone, avatar_url, email, decoded.email);
        if (result.rowsAffected[0] === 0) {
            return NextResponse.json(
                { success: false, message: "Không tìm thấy user để cập nhật" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Cập nhật thông tin thành công"
        });
    } catch (error) {
        console.error("Get personal info failed:", error);
        return NextResponse.json(
            { message: "Get personal info failed" },
            { status: 500 }
        );
    }
}
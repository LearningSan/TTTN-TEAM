/**
 * @swagger
 * /api/resale/buy:
 *   post:
 *     summary: Buyer mua lại vé (resale)
 *     tags:
 *       - Resale
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticket_id
 *             properties:
 *               ticket_id:
 *                 type: string
 *                 example: "ticket_123"
 *     responses:
 *       200:
 *         description: Tạo transfer thành công
 */

import { NextRequest, NextResponse } from "next/server";
import { createTransferTransaction } from "@/app/helper/transferHelper";
import { getUser } from "@/app/lib/user";
import { verifyToken } from "@/app/helper/authenHelper";
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
   const buyer_id = decoded.user_id; // ✅ không cần query DB

    const user = await getUser(decoded.email);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const body = await req.json();
    const { ticket_id } = body;

    if (!ticket_id) {
      return NextResponse.json(
        { message: "ticket_id is required" },
        { status: 400 }
      );
    }
    const result = await createTransferTransaction(ticket_id, buyer_id);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Resale buy error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
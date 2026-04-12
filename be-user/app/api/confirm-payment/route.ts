/**
 * @swagger
 * /api/confirm-payment:
 *   post:
 *     summary: Xác nhận thanh toán (FAKE)
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             payment_id: "payment_123"
 *     responses:
 *       200:
 *         description: Thanh toán thành công
 */

import { NextResponse } from "next/server";
import { confirmPaymentService } from "@/app/helper/paymentHelper";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { payment_id } = body;

    if (!payment_id) {
      return NextResponse.json(
        { message: "payment_id is required" },
        { status: 400 }
      );
    }

    const result = await confirmPaymentService(payment_id);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
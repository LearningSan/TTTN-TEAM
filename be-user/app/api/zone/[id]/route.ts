 /**
 * @swagger
 * /api/zone/{id}:
 *   post:
 *     summary: Lấy thông tin chi tiết zone theo zone_id
 *     tags:
 *       - Zone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - zone_id
 *             properties:
 *               zone_id:
 *                 type: string
 *                 example: "123"
 *     responses:
 *       200:
 *         description: Lấy zone thành công
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 zone_id: "123"
 *                 concert_id: "C1"
 *                 zone_name: "VIP"
 *                 price: 100
 *                 currency: "USD"
 *                 total_seats: 100
 *                 available_seats: 80
 *                 sold_seats: 20
 *                 has_seat_map: true
 *                 status: "ACTIVE"
 *                 created_at: "2026-01-01T00:00:00Z"
 *                 updated_at: "2026-01-01T00:00:00Z"
 *       400:
 *         description: Bad request
 *       404:
 *         description: Zone not found
 *       500:
 *         description: Server error
 */

import { NextRequest, NextResponse } from "next/server";
import { getSpecificZone } from "@/app/helper/zoneHelper";

export async function POST(
  req: NextRequest)
 {
  try {
    const body = await req.json();
    const { zone_id } = body;

    const zone = await getSpecificZone(zone_id);

    return NextResponse.json({
      success: true,
      data: zone,
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}
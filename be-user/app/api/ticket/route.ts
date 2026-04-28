/**
 * @swagger
 * /api/ticket:
 *   get:
 *     summary: Lấy danh sách tất cả vé (admin / marketplace)
 *     description: |
 *       API trả về toàn bộ vé trong hệ thống.
 *       Không filter theo user_id.
 *       Có thể filter theo status để phục vụ marketplace / admin dashboard.
 *
 *       🔥 TRANSFERRED = vé đang được đăng bán (resale marketplace)
 *
 *     tags:
 *       - Tickets
 *
 *     parameters:
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [CANCELLED, TRANSFERRED, USED, ACTIVE, MINTING]
 *         example: TRANSFERRED
 *         description: |
 *           Lọc theo trạng thái vé:
 *           - ACTIVE: vé đang sở hữu
 *           - MINTING: đang mint NFT
 *           - USED: đã sử dụng
 *           - CANCELLED: đã huỷ
 *           - TRANSFERRED ⭐ (RESALE LISTING)
 *
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Trang hiện tại (default = 1)
 *
 *       - in: query
 *         name: pageSize
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Số lượng mỗi trang (default = 10)
 *
 *     responses:
 *       200:
 *         description: Lấy danh sách vé thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Get tickets success
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 120
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           order_id:
 *                             type: string
 *
 *                           order:
 *                             type: object
 *                             properties:
 *                               total_amount:
 *                                 type: number
 *                               currency:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               paid_at:
 *                                 type: string
 *                                 format: date-time
 *
 *                           concert:
 *                             type: object
 *                             properties:
 *                               concert_id:
 *                                 type: string
 *                               title:
 *                                 type: string
 *                               artist:
 *                                 type: string
 *                               concert_date:
 *                                 type: string
 *                                 format: date-time
 *                               banner_url:
 *                                 type: string
 *
 *                           venue:
 *                             type: object
 *                             properties:
 *                               venue_id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               city:
 *                                 type: string
 *                               country:
 *                                 type: string
 *
 *                           tickets:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 ticket_id:
 *                                   type: string
 *                                 status:
 *                                   type: string
 *                                   enum: [CANCELLED, TRANSFERRED, USED, ACTIVE, MINTING]
 *                                 qr_url:
 *                                   type: string
 *
 *                                 zone:
 *                                   type: object
 *                                   properties:
 *                                     zone_id:
 *                                       type: string
 *                                     zone_name:
 *                                       type: string
 *                                     price:
 *                                       type: number
 *                                     color:
 *                                       type: string
 *
 *                                 seat:
 *                                   type: object
 *                                   nullable: true
 *                                   properties:
 *                                     seat_id:
 *                                       type: string
 *                                     row:
 *                                       type: string
 *                                     number:
 *                                       type: number
 *                                     label:
 *                                       type: string
 *
 *                                 tier:
 *                                   type: object
 *                                   nullable: true
 *                                   properties:
 *                                     tier_id:
 *                                       type: string
 *                                     name:
 *                                       type: string
 *                                     price:
 *                                       type: number
 *
 *                                 payment:
 *                                   type: object
 *                                   properties:
 *                                     status:
 *                                       type: string
 *                                     tx_hash:
 *                                       type: string
 *                                     confirmed_at:
 *                                       type: string
 *                                       format: date-time
 *
 *                                 price:
 *                                   type: object
 *                                   properties:
 *                                     unit_price:
 *                                       type: number
 *                                     quantity:
 *                                       type: number
 *                                     subtotal:
 *                                       type: number
 *
 *       500:
 *         description: Lỗi server
 */
import { NextRequest, NextResponse } from "next/server";
import { getTicketsService } from "@/app/helper/ticketHelper";
import { verifyToken } from "@/app/helper/authenHelper";
export async function GET(req: NextRequest) {
  try {

      const token = req.cookies.get("access_token")?.value;
    
        if (!token) {
          return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
          );
        }
    
        const decoded = await verifyToken(token);
    
        if (!decoded) {
          return NextResponse.json(
            { message: "Invalid token" },
            { status: 401 }
          );
        }
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status") || undefined;
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 10);

    const tickets = await getTicketsService({
      status,
      page,
      pageSize,
    });

    return NextResponse.json({
      message: "Get tickets success",
      data: tickets,
    });
  } catch (error: any) {
    console.error("GET tickets error:", error);

    return NextResponse.json(
      { message: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
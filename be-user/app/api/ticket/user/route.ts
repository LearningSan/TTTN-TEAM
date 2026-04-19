/**
 * @swagger
 * /api/ticket/user:
 *   get:
 *     summary: Lấy danh sách vé theo user (group theo order + filter + phân trang)
 *     description: |
 *       API trả về danh sách vé của user đang đăng nhập (từ access_token cookie).
 *       Dữ liệu được group theo order_id, mỗi order chứa nhiều tickets.
 *
 *     tags:
 *       - Tickets
 *
 *     security:
 *       - cookieAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Trang hiện tại (default = 1)
 *
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Số lượng mỗi trang (default = 10)
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [CANCELLED, TRANSFERRED, USED, ACTIVE, MINTING]
 *         example: ACTIVE
 *         description: Lọc theo trạng thái vé
 *
 *     responses:
 *       200:
 *         description: Lấy danh sách vé thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       order_id:
 *                         type: string
 *
 *                       order:
 *                         type: object
 *                         properties:
 *                           total_amount:
 *                             type: number
 *                           currency:
 *                             type: string
 *                           status:
 *                             type: string
 *                           paid_at:
 *                             type: string
 *                             format: date-time
 *
 *                       concert:
 *                         type: object
 *                         properties:
 *                           concert_id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           artist:
 *                             type: string
 *                           concert_date:
 *                             type: string
 *                             format: date-time
 *                           banner_url:
 *                             type: string
 *
 *                       venue:
 *                         type: object
 *                         properties:
 *                           venue_id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           city:
 *                             type: string
 *                           country:
 *                             type: string
 *
 *                       tickets:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             ticket_id:
 *                               type: string
 *                             status:
 *                               type: string
 *                               enum: [CANCELLED, TRANSFERRED, USED, ACTIVE, MINTING]
 *                             qr_url:
 *                               type: string
 *
 *                             zone:
 *                               type: object
 *                               properties:
 *                                 zone_id:
 *                                   type: string
 *                                 zone_name:
 *                                   type: string
 *                                 price:
 *                                   type: number
 *                                 color:
 *                                   type: string
 *
 *                             seat:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 seat_id:
 *                                   type: string
 *                                 row:
 *                                   type: string
 *                                 number:
 *                                   type: number
 *                                 label:
 *                                   type: string
 *
 *                             tier:
 *                               type: object
 *                               nullable: true
 *                               properties:
 *                                 tier_id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                                 price:
 *                                   type: number
 *
 *                             payment:
 *                               type: object
 *                               properties:
 *                                 status:
 *                                   type: string
 *                                 tx_hash:
 *                                   type: string
 *                                 confirmed_at:
 *                                   type: string
 *                                   format: date-time
 *
 *                             price:
 *                               type: object
 *                               properties:
 *                                 unit_price:
 *                                   type: number
 *                                 quantity:
 *                                   type: number
 *                                 subtotal:
 *                                   type: number
 *
 *       401:
 *         description: Unauthorized hoặc token không hợp lệ
 *
 *       500:
 *         description: Lỗi server
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/helper/authenHelper";
import { getTicketByUserIdService } from "@/app/helper/ticketHelper";
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

    const user_id = decoded.user_id;

    const tickets = await getTicketByUserIdService(user_id);

    return NextResponse.json(
      {
        message: "Get tickets success",
        data: tickets
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("GET tickets error:", error);

    return NextResponse.json(
      {
        message: error.message || "Internal server error"
      },
      { status: 500 }
    );
  }
}
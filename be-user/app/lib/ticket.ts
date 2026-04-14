import { connectDB } from "./data";

// lib/ticket.ts

// lib/ticket.ts

export async function createTicket(ticket: any, transaction?: any) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    await request
      .input("order_id", ticket.order_id)
      .input("order_item_id", ticket.order_item_id)
      .input("user_id", ticket.user_id)
      .input("concert_id", ticket.concert_id)
      .input("zone_id", ticket.zone_id)
      .input("seat_id", ticket.seat_id || null) // Seat có thể NULL nếu là vé đứng
      .input("payment_id", ticket.payment_id)
      .input("wallet_address", ticket.wallet_address).query(`
        INSERT INTO tickets (
           ticket_id, order_id, order_item_id, user_id, concert_id, 
           zone_id, seat_id, payment_id, wallet_address, status, 
           purchase_date, created_at, updated_at
        )
        VALUES (
          NEWID(), @order_id, @order_item_id, @user_id, @concert_id, 
          @zone_id, @seat_id, @payment_id, @wallet_address, 'ACTIVE', 
          GETDATE(), GETDATE(), GETDATE()
        )
      `);
  } catch (error) {
    console.error("Error in createTicket DB:", error);
    throw error;
  }
}

export async function getTickets() {
  try {
    const db = await connectDB();
    // Thực hiện JOIN để lấy Tên Concert, Ngày, và Nhãn ghế
    const result = await db.request().query(`
        SELECT 
          t.*, 
          c.title AS concert_title, 
          c.concert_date,
          v.name AS venue_name,
          s.seat_label
        FROM tickets t
        JOIN concerts c ON t.concert_id = c.concert_id
        JOIN venues v ON c.venue_id = v.venue_id
        LEFT JOIN seats s ON t.seat_id = s.seat_id
        ORDER BY t.created_at DESC
      `);

    return result.recordset;
  } catch (error: any) {
    console.error("getTickets error:", error);
    throw new Error(error.message || "Failed to fetch tickets");
  }
}

export async function getTicketById(ticket_id: string) {
  try {
    const db = await connectDB();

    const result = await db.request().input("ticket_id", ticket_id).query(`
        SELECT 
          t.ticket_id,
          t.order_id,
          t.order_item_id,
          t.user_id,
          t.concert_id,
          t.zone_id,
          t.seat_id,
          t.status,
          t.purchase_date,
          t.qr_code,
          t.qr_url,
          t.wallet_address,
          t.token_id,
          t.mint_tx_hash,
          t.contract_address,
          oi.unit_price,     
          oi.quantity        
        FROM tickets t
        LEFT JOIN order_items oi
          ON t.order_item_id = oi.order_item_id
        WHERE t.ticket_id = @ticket_id
      `);

    return result.recordset[0]; // trả 1 ticket chi tiết
  } catch (error: any) {
    console.error("getTicketById error:", error);
    throw new Error(error.message || "Failed to fetch ticket by ID");
  }
}

// Thêm vào lib/seat.ts hoặc dùng trực tiếp trong logic tạo vé
export async function updateSeatStatus(
  seat_id: string,
  status: string,
  transaction?: any,
) {
  const request = transaction
    ? transaction.request()
    : (await connectDB()).request();

  await request
    .input("seat_id", seat_id)
    .input("status", status)
    .query("UPDATE seats SET status = @status WHERE seat_id = @seat_id");
}

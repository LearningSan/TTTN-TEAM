import { connectDB } from "./data";


export async function createTicket(ticket: any, transaction?: any) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

  const result = await request
  .input("order_id", ticket.order_id)
  .input("order_item_id", ticket.order_item_id)
  .input("user_id", ticket.user_id)
  .input("concert_id", ticket.concert_id)
  .input("zone_id", ticket.zone_id)
  .input("seat_id", ticket.seat_id)
  .input("payment_id", ticket.payment_id)
  .input("wallet_address", ticket.wallet_address)
  .input("tier_id", ticket.tier_id)
  .input("token_id", ticket.token_id)
  .input("mint_tx_hash", ticket.mint_tx_hash)
  .input("contract_address", ticket.contract_address)
  .query(`
    INSERT INTO tickets (
      order_id, order_item_id, user_id, concert_id,
      zone_id, seat_id, payment_id,
      wallet_address, tier_id,
      token_id, mint_tx_hash, contract_address,
      status
    )
    OUTPUT INSERTED.ticket_id
    VALUES (
      @order_id, @order_item_id, @user_id, @concert_id,
      @zone_id, @seat_id, @payment_id,
      @wallet_address, @tier_id,
      @token_id, @mint_tx_hash, @contract_address,
      'ACTIVE'
    )
  `);

return result.recordset[0].ticket_id;
  } catch (error) {
    console.error("Create ticket error:", error);
    throw error;
  }
}

export async function getTickets() {
  try {
    const db = await connectDB();

    const result = await db.request().query(`
      SELECT *
      FROM tickets
      ORDER BY created_at DESC
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

    const result = await db.request()
      .input("ticket_id", ticket_id)
      .query(`
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

export async function updateTicketQR(
  ticket_id: string,
  qr_code: string,
  qr_url: string
) {
  try {
    if (!ticket_id) {
      throw new Error("ticket_id is required");
    }

    const db = await connectDB();

    const result = await db.request()
      .input("ticket_id", ticket_id)
      .input("qr_code", qr_code)
      .input("qr_url", qr_url)
      .query(`
        UPDATE tickets
        SET qr_code = @qr_code,
            qr_url = @qr_url
        WHERE ticket_id = @ticket_id
      `);

    if (result.rowsAffected[0] === 0) {
      console.warn(`Ticket not found or not updated: ${ticket_id}`);
      return false;
    }

    return true;

  } catch (error: any) {
    console.error("Update ticket QR error:", {
      ticket_id,
      error: error.message,
    });

    return false;
  }
}
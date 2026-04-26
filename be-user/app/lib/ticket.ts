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



export async function getTickets({
  status,
  page = 1,
  pageSize = 10,
}: {
  status?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  try {
    const db = await connectDB();
    const offset = (page - 1) * pageSize;

    const request = db.request()
      .input("offset", offset)
      .input("pageSize", pageSize);

    let query = `
SELECT 
  t.ticket_id,
  t.order_id,
  t.order_item_id,
  t.user_id,
  t.status,
  t.purchase_date,
  t.used_at,
  t.qr_url,
  t.token_id,

  o.total_amount,
  o.currency,
  o.order_status,
  o.paid_at,

  oi.quantity,
  oi.unit_price,
  oi.subtotal,

  c.concert_id,
  c.title,
  c.artist,
  c.concert_date,
  c.banner_url,

  v.venue_id,
  v.name AS venue_name,
  v.city,
  v.country,

  z.zone_id,
  z.zone_name,
  z.price AS zone_price,
  z.color_code,

  s.seat_id,
  s.row_label,
  s.seat_number,
  s.seat_label,

  st.tier_id,
  st.tier_name,
  st.price AS tier_price,

  p.payment_status,
  p.transaction_hash,
  p.confirmed_at,

  COUNT(*) OVER() AS total

FROM tickets t

LEFT JOIN orders o 
  ON t.order_id = o.order_id

LEFT JOIN order_items oi 
  ON t.order_item_id = oi.order_item_id

LEFT JOIN concerts c 
  ON t.concert_id = c.concert_id

LEFT JOIN venues v 
  ON c.venue_id = v.venue_id

LEFT JOIN zones z 
  ON t.zone_id = z.zone_id

LEFT JOIN seats s 
  ON t.seat_id = s.seat_id

LEFT JOIN seat_tiers st 
  ON t.tier_id = st.tier_id

LEFT JOIN payment_transactions p 
  ON t.payment_id = p.payment_id

WHERE 1=1
`;

    // 🎯 optional filter
    if (status) {
      request.input("status", status);
      query += ` AND t.status = @status`;
    }

    query += `
ORDER BY t.created_at DESC
OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
`;

    const result = await request.query(query);
    const rows = result.recordset;

    if (!rows.length) {
      return {
        total: 0,
        data: []
      };
    }

    // 🔥 GROUP BY ORDER_ID (GIỐNG USER API)
    const grouped: any = {};

    rows.forEach(row => {
      if (!grouped[row.order_id]) {
        grouped[row.order_id] = {
          order_id: row.order_id,

          order: {
            total_amount: row.total_amount,
            currency: row.currency,
            status: row.order_status,
            paid_at: row.paid_at
          },

          concert: {
            concert_id: row.concert_id,
            title: row.title,
            artist: row.artist,
            concert_date: row.concert_date,
            banner_url: row.banner_url
          },

          venue: {
            venue_id: row.venue_id,
            name: row.venue_name,
            city: row.city,
            country: row.country
          },

          tickets: []
        };
      }

      grouped[row.order_id].tickets.push({
        ticket_id: row.ticket_id,
        status: row.status,
        qr_url: row.qr_url,

        zone: {
          zone_id: row.zone_id,
          zone_name: row.zone_name,
          price: row.zone_price,
          color: row.color_code
        },

        seat: row.seat_id ? {
          seat_id: row.seat_id,
          row: row.row_label,
          number: row.seat_number,
          label: row.seat_label
        } : null,

        tier: row.tier_id ? {
          tier_id: row.tier_id,
          name: row.tier_name,
          price: row.tier_price
        } : null,

        payment: {
          status: row.payment_status,
          tx_hash: row.transaction_hash,
          confirmed_at: row.confirmed_at
        },

        price: {
          unit_price: row.unit_price,
          quantity: row.quantity,
          subtotal: row.subtotal
        }
      });
    });

    return {
      total: rows[0].total,
      data: Object.values(grouped)
    };

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
export async function getTicketsByUserId(
  user_id: string,
  page: number = 1,
  pageSize: number = 10,
  status?: string
) {
  try {
    const db = await connectDB();

    const offset = (page - 1) * pageSize;

   let query = `
SELECT 
  -- 🎫 TICKET
  t.ticket_id,
  t.order_id,
  t.order_item_id,
  t.user_id,
  t.status,
  t.purchase_date,
  t.used_at,
  t.qr_url,
  t.token_id,

  o.total_amount,
  o.currency,
  o.order_status,
  o.paid_at,

  oi.quantity,
  oi.unit_price,
  oi.subtotal,

  -- 🎤 CONCERT
  c.concert_id,
  c.title,
  c.artist,
  c.concert_date,
  c.banner_url,

  v.venue_id,
  v.name AS venue_name,
  v.city,
  v.country,

  z.zone_id,
  z.zone_name,
  z.price AS zone_price,
  z.has_seat_map,
  z.color_code,

  s.seat_id,
  s.row_label,
  s.seat_number,
  s.seat_label,

  st.tier_id,
  st.tier_name,
  st.price AS tier_price,

  p.payment_status,
  p.transaction_hash,
  p.confirmed_at,

  COUNT(*) OVER() AS total

FROM tickets t

LEFT JOIN orders o 
  ON t.order_id = o.order_id

LEFT JOIN order_items oi 
  ON t.order_item_id = oi.order_item_id

LEFT JOIN concerts c 
  ON t.concert_id = c.concert_id

LEFT JOIN venues v 
  ON c.venue_id = v.venue_id

LEFT JOIN zones z 
  ON t.zone_id = z.zone_id

LEFT JOIN seats s 
  ON t.seat_id = s.seat_id

LEFT JOIN seat_tiers st 
  ON t.tier_id = st.tier_id

LEFT JOIN payment_transactions p 
  ON t.payment_id = p.payment_id

WHERE t.user_id = @user_id
`;

if (status) {
  query += ` AND t.status = @status`;
}

query += `
  ORDER BY t.created_at DESC
  OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
`;

    const request = db.request()
      .input("user_id", user_id)
      .input("offset", offset)
      .input("pageSize", pageSize);

    if (status) {
      request.input("status", status);
    }

    const result = await request.query(query);
    const rows = result.recordset;

    if (!rows.length) {
      return {
        total: 0,
        data: []
      };
    }

    // 🔥 GROUP BY ORDER_ID
   const grouped: any = {};

rows.forEach(row => {
  if (!grouped[row.order_id]) {
    grouped[row.order_id] = {
      order_id: row.order_id,

      order: {
        total_amount: row.total_amount,
        currency: row.currency,
        status: row.order_status,
        paid_at: row.paid_at
      },

      concert: {
        concert_id: row.concert_id,
        title: row.title,
        artist: row.artist,
        concert_date: row.concert_date,
        banner_url: row.banner_url
      },

      venue: {
        venue_id: row.venue_id,
        name: row.venue_name,
        city: row.city,
        country: row.country
      },

      tickets: []
    };
  }

  grouped[row.order_id].tickets.push({
    ticket_id: row.ticket_id,
    status: row.status,
    qr_url: row.qr_url,

    zone: {
      zone_id: row.zone_id,
      zone_name: row.zone_name,
      price: row.zone_price,
      color: row.color_code
    },

    seat: row.seat_id ? {
      seat_id: row.seat_id,
      row: row.row_label,
      number: row.seat_number,
      label: row.seat_label
    } : null,

    tier: row.tier_id ? {
      tier_id: row.tier_id,
      name: row.tier_name,
      price: row.tier_price
    } : null,

    payment: {
      status: row.payment_status,
      tx_hash: row.transaction_hash,
      confirmed_at: row.confirmed_at
    },

    price: {
      unit_price: row.unit_price,
      quantity: row.quantity,
      subtotal: row.subtotal
    }
  });
});

  return {
  total: Object.keys(grouped).length, 
  data: Object.values(grouped)
};

  } catch (error: any) {
    console.error("getTicketsByUserId error:", error);
    throw new Error(error.message || "Failed to fetch tickets by user ID");
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

export async function updateTicketOwner(
  ticket_id: string,
  to_user_id: string,
  to_wallet: string,
  transaction?: any
) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    await request
      .input("ticket_id", ticket_id)
      .input("to_user_id", to_user_id)
      .input("to_wallet", to_wallet)
      .query(`
        UPDATE tickets  
        SET 
          user_id = @to_user_id,
          wallet_address = @to_wallet,
          updated_at = GETDATE()
        WHERE ticket_id = @ticket_id
      `);

  } catch (error) {
    console.error("Error in updateTicketOwner:", error);
    throw new Error("Cập nhật owner vé thất bại");
  }
}
export async function getTicketForUpdate(ticket_id: string, transaction?: any) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    const result = await request
      .input("ticket_id", ticket_id)
      .query(`
        SELECT t.*, oi.subtotal, oi.quantity
        FROM tickets t WITH (UPDLOCK, ROWLOCK)
        JOIN order_items oi ON t.order_item_id = oi.order_item_id
        WHERE t.ticket_id = @ticket_id
      `);

    return result.recordset[0];

  } catch (error) {
    console.error("Error in getTicketForUpdate:", error);
    throw new Error("Lấy ticket thất bại");
  }
}

export async function markTicketAsTransferred(
  ticket_id: string,
  transaction?: any
) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    await request
      .input("ticket_id", ticket_id)
      .query(`
        UPDATE tickets
        SET 
          status = 'TRANSFERRED',
          updated_at = GETDATE()
        WHERE ticket_id = @ticket_id
          AND status = 'ACTIVE'
      `);

    return true;

  } catch (error) {
    console.error("Error in markTicketAsTransferred:", error);
    throw new Error("Failed to mark ticket as TRANSFERRED");
  }
}


export async function cancelTicketResale(
  ticket_id: string,
  transaction?: any
) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    const result = await request
      .input("ticket_id", ticket_id)
      .query(`
        UPDATE tickets
        SET 
          status = 'ACTIVE',
          updated_at = GETDATE()
        WHERE ticket_id = @ticket_id
          AND status = 'TRANSFERRED'
      `);

    return result.rowsAffected[0] > 0;

  } catch (error) {
    console.error("cancelTicketResale error:", error);
    throw new Error("Failed to cancel resale listing");
  }
}

export async function updateTicketStatus(
  ticket_id: string,
  status: string,
  transaction: any
) {
  const request = transaction.request()
    .input("ticket_id", ticket_id)
    .input("status", status);

  await request.query(`
    UPDATE tickets
    SET status = @status
    WHERE ticket_id = @ticket_id
  `);
}
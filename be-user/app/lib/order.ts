import { connectDB } from "./data";

export async function insertOrder(data: any): Promise<string> {
  const db = await connectDB();

  try {
    const request = db.request()
      .input("user_id", data.user_id)
      .input("concert_id", data.concert_id)
      .input("total_amount", data.total_amount)
      .input("currency", data.currency)
      .input("note", data.note || null);

    const query = `
      INSERT INTO orders (
        user_id,
        concert_id,
        total_amount,
        currency,
        order_status,
        note,
        created_at,
        expires_at,
        updated_at
      )
      OUTPUT INSERTED.order_id
      VALUES (
        @user_id,
        @concert_id,
        @total_amount,
        @currency,
        'PENDING',
        @note,
        GETDATE(),
        DATEADD(MINUTE, 15, GETDATE()),
        GETDATE()
      )
    `;

    const result = await request.query(query);

    return result.recordset[0].order_id;

  } catch (error) {
    console.error("insertOrder DB error:", error);
    throw error;
  }
}

export async function insertOrderItem(data: any) {
  const db = await connectDB();

  try {
    const request = db.request()
      .input("order_id", data.order_id)
      .input("zone_id", data.zone_id)
      .input("seat_id", data.seat_id)
      .input("quantity", data.quantity)
      .input("unit_price", data.unit_price);

    const query = `
      INSERT INTO order_items (
        order_id,
        zone_id,
        seat_id,
        quantity,
        unit_price
      )
      VALUES (
        @order_id,
        @zone_id,
        @seat_id,
        @quantity,
        @unit_price
      )
    `;

    await request.query(query);

    return true;

  } catch (error) {
    console.error("insertOrderItem DB error:", error);
    throw error;
  }
}
export async function getOrderById(order_id: string) {
  const db = await connectDB();

  try {
    const request = db.request()
      .input("order_id", order_id);

    const query = `
      SELECT 
        order_id,
        user_id,
        concert_id,
        total_amount,
        currency,
        order_status,
        wallet_address,
        payment_id,
        note,
        created_at,
        expires_at,
        paid_at,
        updated_at
      FROM orders
      WHERE order_id = @order_id
    `;

    const result = await request.query(query);

    // 👉 không có order
    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0];

  } catch (error) {
    console.error("getOrderById DB error:", error);
    throw error;
  }
}
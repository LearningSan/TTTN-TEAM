import { connectDB } from "./data";

export async function insertOrder(data: any): Promise<string> {
  const db = await connectDB();

  try {
   const request = db.request()
    .input("user_id", data.user_id)
    .input("concert_id", data.concert_id)
    .input("total_amount", data.total_amount)
    .input("currency", data.currency)
    .input("note", data.note || null)
    .input("wallet_address", data.wallet_address);

  const query = `
    INSERT INTO orders (
      user_id,
      concert_id,
      wallet_address,
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
      @wallet_address,
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

  const request = db.request()
    .input("order_id", data.order_id)
    .input("zone_id", data.zone_id)
    .input("tier_id", data.tier_id || null)
    .input("seat_id", data.seat_id || null)
    .input("quantity", data.quantity)
    .input("unit_price", data.unit_price);

  const query = `
    INSERT INTO order_items (
      order_id,
      zone_id,
      tier_id,
      seat_id,
      quantity,
      unit_price
    )
    VALUES (
      @order_id,
      @zone_id,
      @tier_id,
      @seat_id,
      @quantity,
      @unit_price
    )
  `;

  await request.query(query);

  return true;
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
export async function getOrderItems(order_id: string) {
  try {
    const db = await connectDB();

    const result = await db.request()
      .input("order_id", order_id)
      .query(`
        SELECT * FROM order_items
        WHERE order_id = @order_id
      `);

    return result.recordset;
  } catch (error) {
    console.error("Error in getOrderItems:", error);
    throw new Error("Lấy danh sách order items thất bại");
  }
}

export async function markOrderCompleted(order_id: string, transaction?: any) {
  try {
    const request = transaction ? transaction.request() : (await connectDB()).request();

    await request
      .input("order_id", order_id)
      .query(`
        UPDATE orders
        SET 
          order_status = 'COMPLETED',
          updated_at = GETDATE()
        WHERE order_id = @order_id
      `);
  } catch (error) {
    console.error("Error in markOrderCompleted:", error);
    throw new Error("Cập nhật trạng thái order thành COMPLETED thất bại");
  }
}

export async function markOrderPaid(order_id: string, transaction?: any) {
  try {
    const request = transaction ? transaction.request() : (await connectDB()).request();

    await request
      .input("order_id", order_id)
      .query(`
        UPDATE orders
        SET 
          order_status = 'PAID',
          paid_at = GETDATE(),
          updated_at = GETDATE()
        WHERE order_id = @order_id
      `);
  } catch (error) {
    console.error("Error in markOrderPaid:", error);
    throw new Error("Cập nhật trạng thái order thành PAID thất bại");
  }
}
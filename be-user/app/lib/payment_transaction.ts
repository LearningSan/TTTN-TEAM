import { connectDB } from "./data";

export async function insertPayment(data: any): Promise<string> {
  const db = await connectDB();

  try {
    const request = db.request()
      .input("order_id", data.order_id)
      .input("user_id", data.user_id)
      .input("concert_id", data.concert_id)
      .input("amount", data.amount)
      .input("currency", data.currency)
      .input("from_wallet", data.from_wallet)
      .input("to_wallet", data.to_wallet);

    const query = `
      INSERT INTO payment_transactions (
        payment_id,
        order_id,
        user_id,
        concert_id,
        amount,
        currency,
        from_wallet,
        to_wallet,
        payment_status,
        retry_count,
        created_at,
        updated_at
      )
      OUTPUT INSERTED.payment_id
      VALUES (
        NEWID(),
        @order_id,
        @user_id,
        @concert_id,
        @amount,
        @currency,
        @from_wallet,
        @to_wallet,
        'PENDING',
        0,
        GETDATE(),
        GETDATE()
      )
    `;

    const result = await request.query(query);

    return result.recordset[0].payment_id;

  } catch (error) {
    console.error("insertPayment DB error:", error);
    throw error;
  }
}


export async function updateOrderPayment(
  order_id: string,
  payment_id: string
) {
  const db = await connectDB();

  try {
    const request = db.request()
      .input("order_id", order_id)
      .input("payment_id", payment_id);

    const query = `
      UPDATE orders
      SET 
        payment_id = @payment_id,
        updated_at = GETDATE()
      WHERE order_id = @order_id
    `;

    await request.query(query);

  } catch (error) {
    console.error("updateOrderPayment DB error:", error);
    throw error;
  }
}
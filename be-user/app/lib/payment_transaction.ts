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



export async function getPaymentById(payment_id: string) {
  try {
    const db = await connectDB();

    const result = await db.request()
      .input("payment_id", payment_id)
      .query(`
        SELECT * FROM payment_transactions
        WHERE payment_id = @payment_id
      `);

    return result.recordset[0];
  } catch (error) {
    console.error("Error in getPaymentById:", error);
    throw new Error("Lấy thông tin payment thất bại");
  }
}

export async function markPaymentSuccess(
  payment_id: string,
  hash: string,
  block_number?: number,
  transaction?: any
) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    await request
      .input("payment_id", payment_id)
      .input("hash", hash)
      .input("block_number", block_number)
      .query(`
        UPDATE payment_transactions
        SET 
          payment_status = 'SUCCESS',
          transaction_hash = @hash,
          block_number = @block_number,
          confirmed_at = GETDATE(),
          updated_at = GETDATE()
        WHERE payment_id = @payment_id
      `);
  } catch (error) {
    console.error("Error in markPaymentSuccess:", error);
    throw new Error("Cập nhật payment thất bại");
  }
}

export async function markPaymentFailed(
  payment_id: string,
  failure_reason: string,
  transaction?: any
) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    await request
      .input("payment_id", payment_id)
      .input("failure_reason", failure_reason)
      .query(`
        UPDATE payment_transactions
        SET 
          payment_status = 'FAILED',
          failure_reason = @failure_reason,
          updated_at = GETDATE()
        WHERE payment_id = @payment_id
      `);

  } catch (error) {
    console.error("Error in markPaymentFailed:", error);
    throw new Error("Cập nhật payment FAILED thất bại");
  }
}
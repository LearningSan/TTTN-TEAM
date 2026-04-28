import { connectDB } from "./data";


export async function checkPendingTransfer(ticket_id: string, transaction?: any) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    const result = await request
      .input("ticket_id", ticket_id)
      .query(`
        SELECT 1
        FROM transfer_transactions
        WHERE ticket_id = @ticket_id
        AND transfer_status = 'PENDING'
      `);

    return result.recordset.length > 0;

  } catch (error) {
    console.error("Error in checkPendingTransfer:", error);
    throw new Error("Kiểm tra pending transfer thất bại");
  }
}

export async function insertTransfer(
  data: {
    ticket_id: string;
    from_user_id: string;
    to_user_id: string;
    from_wallet: string;
    to_wallet: string;
  },
  transaction?: any
) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    const result = await request
      .input("ticket_id", data.ticket_id)
      .input("from_user_id", data.from_user_id)
      .input("to_user_id", data.to_user_id)
      .input("from_wallet", data.from_wallet)
      .input("to_wallet", data.to_wallet)
      .query(`
        INSERT INTO transfer_transactions (
          ticket_id,
          from_user_id,
          to_user_id,
          from_wallet,
          to_wallet,
          transfer_status,
          transfer_date
        )
        OUTPUT INSERTED.transfer_id
        VALUES (
          @ticket_id,
          @from_user_id,
          @to_user_id,
          @from_wallet,
          @to_wallet,
          'PENDING',
          GETDATE()
        )
      `);

    return result.recordset[0].transfer_id;

  } catch (error) {
    console.error("Error in insertTransfer:", error);
    throw new Error("Tạo transfer thất bại");
  }
}
export async function getTransferById(
  transfer_id: string,
  transaction?: any
) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    const result = await request
      .input("transfer_id", transfer_id)
      .query(`
        SELECT *
        FROM transfer_transactions
        WHERE transfer_id = @transfer_id
      `);

    return result.recordset[0];

  } catch (error) {
    console.error("Error in getTransferById:", error);
    throw new Error("Lấy transfer thất bại");
  }
}
export async function markTransferSuccess(
  transfer_id: string,
  tx_hash: string,
  block_number: number,
  transaction?: any
) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    await request
      .input("transfer_id", transfer_id)
      .input("tx_hash", tx_hash)
      .input("block_number", block_number)
      .query(`
        UPDATE transfer_transactions
        SET 
          transfer_status = 'SUCCESS',
          transaction_hash = @tx_hash,
          confirmed_at = GETDATE()
        WHERE transfer_id = @transfer_id
      `);

  } catch (error) {
    console.error("Error in markTransferSuccess:", error);
    throw new Error("Cập nhật transfer thất bại");
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

export async function checkPendingTransferByTicket(ticket_id: string) {
  try {
    const pool = await connectDB();

    const result = await pool.request()
      .input("ticket_id", ticket_id)
      .query(`
        SELECT TOP 1 *
        FROM transfer_transactions
        WHERE ticket_id = @ticket_id
          AND transfer_status = 'PENDING'
        ORDER BY transfer_date DESC
      `);

    const transfer = result.recordset[0];

    if (!transfer) {
      return {
        ok: false,
        reason: "NO_PENDING_TRANSFER"
      };
    }

    return {
      ok: true,
      transfer
    };

  } catch (err) {
    console.error(err);
    return {
      ok: false,
      reason: "SERVER_ERROR"
    };
  }
}
export async function getPendingTransfersByWallet(
  wallet: string,
  transaction?: any
) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    const result = await request
      .input("wallet", wallet)
      .query(`
        SELECT 
          t.transfer_id,
          t.ticket_id,
          t.from_wallet,
          t.to_wallet,
          t.transfer_status,
          t.transfer_date,
          tk.token_id,
          tk.contract_address
        FROM transfer_transactions t
        JOIN tickets tk ON t.ticket_id = tk.ticket_id
        WHERE t.from_wallet = @wallet
          AND t.transfer_status = 'PENDING'
        ORDER BY t.transfer_date DESC
      `);

    return result.recordset;

  } catch (error) {
    console.error("Error getPendingTransfersByWallet:", error);
    throw new Error("DB get transfers failed");
  }
}

export async function getAllPendingTransfersDB(transaction?: any) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    const result = await request.query(`
      SELECT 
        t.transfer_id,
        t.ticket_id,
        t.from_wallet,
        t.to_wallet,
        t.transfer_status,
        t.transfer_date,
        tk.token_id,
        tk.contract_address
      FROM transfer_transactions t
      JOIN tickets tk ON t.ticket_id = tk.ticket_id
      WHERE t.transfer_status = 'PENDING'
      ORDER BY t.transfer_date DESC
    `);

    return result.recordset;

  } catch (error) {
    console.error("Error getAllPendingTransfersDB:", error);
    throw new Error("DB get all transfers failed");
  }
}
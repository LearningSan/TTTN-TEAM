import { connectDB } from "../lib/data";
import { getPaymentById, insertPayment, updateOrderPayment, markPaymentSuccess, markPaymentFailed } from "../lib/payment_transaction";
import { markOrderPaid } from "../lib/order";
import { markSeatsBookedByOrder } from "../lib/seat";
import { updateTicketQR, createTicketRecords, updateTicketToken,createTicket } from "../lib/ticket";
import { updateZoneAfterPayment } from "../lib/zone";
import { getContract } from "../lib/contract";

import QRCode from "qrcode";

import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
export async function createPayment({
  order_id,
  user_id,
  from_wallet = null,
  to_wallet = null
}: any) {
  const pool = await connectDB();
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    const request = transaction.request();

    const orderResult = await request
      .input("order_id", order_id)
      .query(`
        SELECT *
        FROM orders WITH (UPDLOCK, ROWLOCK)
        WHERE order_id = @order_id
      `);

    const order = orderResult.recordset[0];

    if (!order) throw new Error("Order not found");

    if (order.order_status !== "PENDING") {
      throw new Error("Order is not payable");
    }

    if (order.payment_id) {
      throw new Error("Order already has payment");
    }
    const timeResult = await request.query(`
  SELECT GETDATE() AS now
`);

    const now = new Date(timeResult.recordset[0].now);
    const expiresAt = new Date(order.expires_at);

    if (expiresAt.getTime() <= now.getTime()) {
      throw new Error("Order expired");
    }

    if (expiresAt.getTime() < now.getTime()) {
      throw new Error("Order expired");
    }
    const payment_id = await insertPayment({
      order_id,
      user_id,
      concert_id: order.concert_id,
      amount: order.total_amount,
      currency: order.currency,
      from_wallet,
      to_wallet
    }, transaction);

    await updateOrderPayment(order_id, payment_id, transaction);

    await transaction.commit();

    return {
      payment_id,
      order_id,
      status: "PENDING"
    };

  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}
export async function confirmPaymentService(payment_id: string, tx_hash: string) {
  const payment = await getPaymentById(payment_id);
  if (!payment) throw new Error("Payment not found");

  const receipt = await provider.getTransactionReceipt(tx_hash);

  if (!receipt) {
    await markPaymentFailed(payment_id, "Transaction not found");
    throw new Error("Transaction not found");
  }

  if (receipt.status !== 1) {
    await markPaymentFailed(payment_id, "Transaction failed");
    throw new Error("Transaction failed");
  }

  const pool = await connectDB();
  const transaction = pool.transaction();

  let ticketIntents: any[] = [];

  try {
    await transaction.begin();

    // ======================
    // PHASE 1: DB ONLY
    // ======================
    await markPaymentSuccess(payment_id, tx_hash, receipt.blockNumber, transaction);
    await markOrderPaid(payment.order_id, transaction);
    await updateZoneAfterPayment(payment.order_id, transaction);
    await markSeatsBookedByOrder(payment.order_id, transaction);

    ticketIntents = await createTicketRecords(payment, transaction);

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }


  const contract = getContract();

  const createdTickets: any[] = [];

  for (const t of ticketIntents) {
    try {
      const tx = await contract.mint(payment.from_wallet);
      const rec = await tx.wait();

      const tokenId = extractTokenId(rec, contract);

      const ticketId = await createTicket({
        order_id: t.order_id,
        order_item_id: t.order_item_id,
        user_id: t.user_id,
        concert_id: t.concert_id,
        zone_id: t.zone_id,
        seat_id: t.seat_id,
        payment_id: t.payment_id,
        wallet_address: t.wallet_address,
        tier_id: t.tier_id,

        token_id: tokenId,
        mint_tx_hash: tx.hash,
        contract_address: process.env.CONTRACT_ADDRESS!
      });

      await updateTicketToken(ticketId, tokenId, tx.hash);

      const qrData = `ticket_id=${ticketId}&token_id=${tokenId}`;
      const qrUrl = await generateQRCode(qrData);

      if (!qrUrl) throw new Error("QR fail");

      await updateTicketQR(ticketId, qrData, qrUrl);

      createdTickets.push({ ticketId, tokenId });

    } catch (err) {
      console.error("Mint failed ticket:", t, err);
    }
  }

  return {
    success: true,
    tx_hash,
    block_number: receipt.blockNumber,
    tickets: createdTickets
  };
}

export async function generateQRCode(data: string) {
  try {
    if (!data) {
      throw new Error("QR data is empty");
    }

    const qrUrl = await QRCode.toDataURL(data);
    return qrUrl;

  } catch (error: any) {
    console.error("Generate QR error:", error);
    return null;
  }
}

export function extractTokenId(receipt: any, contract: any): string {
  const transferEvent = receipt.logs
    .map((log: any) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((e: any) => e && e.name === "Transfer");

  if (!transferEvent) {
    throw new Error("Transfer event not found");
  }

  return transferEvent.args.tokenId.toString();
}
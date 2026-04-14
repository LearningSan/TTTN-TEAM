import { connectDB } from "../lib/data";
import { getPaymentById, insertPayment, updateOrderPayment,markPaymentSuccess } from "../lib/payment_transaction";
import { getOrderById,markOrderPaid } from "../lib/order";
import { createTicketsFromOrder } from "./ticketHelper";
import { markSeatsBookedByOrder } from "../lib/seat";
import { updateTicketQR } from "../lib/ticket";
import QRCode from "qrcode";

import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
export async function createPayment({
  order_id,
  user_id,
  from_wallet=null,
  to_wallet=null
}: any) {
  const order = await getOrderById(order_id);

  if (!order) throw new Error("Order not found");

  if (order.order_status !== "PENDING") {
    throw new Error("Order is not payable");
  }

  if (new Date(order.expires_at) < new Date()) {
    throw new Error("Order expired");
  }

  const payment_id = await insertPayment({
    order_id,
    user_id,
    concert_id: order.concert_id,
    amount: order.total_amount,
    currency: order.currency,
    from_wallet,
    to_wallet,
    payment_status: "PENDING"
  });

  await updateOrderPayment(order_id, payment_id);

  return {
    payment_id,
    order_id,
    status: "PENDING"
  };
}

export async function confirmPaymentService(payment_id: string, tx_hash: string) {
  const payment = await getPaymentById(payment_id);
  if (!payment) throw new Error("Payment not found");

  if (payment.payment_status !== "PENDING") {
    throw new Error("Payment already processed");
  }

  const receipt = await provider.getTransactionReceipt(tx_hash);

  if (!receipt) throw new Error("Transaction not found");
  if (receipt.status !== 1) throw new Error("Transaction failed");

  const pool = await connectDB();
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    await markPaymentSuccess(
      payment_id,
      tx_hash,
      receipt.blockNumber,
      transaction
    );

    await markOrderPaid(payment.order_id, transaction);

    await transaction.commit();

  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  const createdTickets = await createTicketsFromOrder(payment);

  await markSeatsBookedByOrder(payment.order_id);

  for (const t of createdTickets) {
    const qrData = `ticket_id=${t.ticketId}&token_id=${t.tokenId}`;

    const qrUrl = await generateQRCode(qrData);
    if(!qrUrl) 
      throw new Error("Failed to generate QR code");
   const ok = await updateTicketQR(t.ticketId, qrData, qrUrl);
   if(!ok) 
    throw new Error(`Failed to update QR code for ticket ${t.ticketId}`);
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
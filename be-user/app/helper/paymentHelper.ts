import { connectDB } from "../lib/data";
import {
  getPaymentById,
  insertPayment,
  updateOrderPayment,
  markPaymentSuccess,
} from "../lib/payment_transaction";
import { getOrderById, markOrderCompleted, markOrderPaid } from "../lib/order";
import { createTicketsFromOrder } from "./ticketHelper";
import { markSeatsBookedByOrder } from "../lib/seat";
export async function createPayment({
  order_id,
  user_id,
  from_wallet = null,
  to_wallet = null,
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
    payment_status: "PENDING",
  });

  await updateOrderPayment(order_id, payment_id);

  return {
    payment_id,
    order_id,
    status: "PENDING",
  };
}

// paymentHelper.ts

export async function confirmPaymentService(payment_id: string) {
  const payment = await getPaymentById(payment_id);
  if (!payment) throw new Error("Payment not found");

  const fakeHash = "0x" + Math.random().toString(16).substring(2, 15);
  const pool = await connectDB();
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // 1. Cập nhật trạng thái Payment thành SUCCESS
    await markPaymentSuccess(payment_id, fakeHash, transaction);

    // 2. Cập nhật trạng thái Order thành PAID
    await markOrderPaid(payment.order_id, transaction);

    // 3. TẠO VÉ (Đây là bước quan trọng để hiện vé)
    // Đảm bảo hàm này nhận vào object payment và transaction
    await createTicketsFromOrder(payment, transaction);

    await transaction.commit();

    return { success: true, transaction_hash: fakeHash };
  } catch (error: any) {
    await transaction.rollback();
    console.error("Lỗi SQL chi tiết:", error); // Log này giúp bạn xem lỗi cột nào trong DB
    throw new Error(error.message || "Failed to complete payment process");
  }
}

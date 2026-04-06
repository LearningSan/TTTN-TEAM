import { insertPayment, updateOrderPayment } from "../lib/payment_transaction";
import { getOrderById } from "../lib/order";

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

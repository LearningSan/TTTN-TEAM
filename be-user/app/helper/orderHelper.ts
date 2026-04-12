import { getZonePrice } from "../lib/zone";
import { validateSeats,lockSeats } from "../lib/seat";
import { insertOrder, insertOrderItem,getOrderById } from "../lib/order";

 export type CreateOrderInput = {
  user_id: string;
  concert_id: string;
  items: any[];
  currency: string;
  note?: string;
};
export async function createOrder(data: CreateOrderInput) {
  try {
    const { user_id, concert_id, items, currency, note } = data;

  await validateSeats(concert_id, items);

  let total_amount = 0;
  const orderItems = [];

  for (const item of items) {
    const price = await getZonePrice(item.zone_id);
    const subtotal = price * item.quantity;

    total_amount += subtotal;

    orderItems.push({
      zone_id: item.zone_id,
      seat_id: item.seat_id,
      quantity: item.quantity,
      unit_price: price
    });
  }

  const order_id = await insertOrder({
    user_id,
    concert_id,
    total_amount,
    currency,
    note
  });

  for (const item of orderItems) {
    await insertOrderItem({
      order_id,
      ...item
    });
  }
  await lockSeats(user_id, orderItems);

  // 🔥 thêm expires_at để FE countdown
  const expires_at = new Date(Date.now() + 15 * 60 * 1000);

  return {
    order: {
      order_id,
      user_id,
      concert_id,
      total_amount,
      currency,
      order_status: "PENDING",
      note: note || null,
      created_at: new Date(),
      expires_at
    },
    items: orderItems,
    summary: {
      total_items: orderItems.length,
      total_quantity: orderItems.reduce((sum, i) => sum + i.quantity, 0),
      total_amount
    }
  };
  } catch (error: any) {
  throw new Error(error.message);
}

  
}
export async function getSpecificOrder(order_id: string) {
try {
  const order = await getOrderById(order_id);
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
} catch (error: any) {
  throw new Error(error.message);
}

}
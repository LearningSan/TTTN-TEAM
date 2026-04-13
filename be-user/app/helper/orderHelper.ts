import { getZoneById } from "../lib/zone";
import { validateSeats,lockSeats, getSeatById } from "../lib/seat";
import { insertOrder, insertOrderItem,getOrderById } from "../lib/order";
 export type CreateOrderInput = {
  user_id: string;
  concert_id: string;
  items: any[];
  currency: string;
  note?: string;
};
export async function createOrder(data: CreateOrderInput) {
  const { user_id, concert_id, items, currency, note } = data;

  await validateSeats(concert_id, items);

  let total_amount = 0;
  const orderItems: any[] = [];

  for (const item of items) {
    const zone = await getZoneById(item.zone_id);

    let unit_price = 0;
    let tier_id: string | null = null;


    if (!zone.has_seat_map) {
      if ("seat_id" in item) {
        throw new Error(
          `Zone ${item.zone_id} does not support seat selection`
        );
      }

      unit_price = zone.price;
    }


    else {
      if (!item.seat_id) {
        throw new Error(
          `seat_id is required for zone ${item.zone_id}`
        );
      }

      const seatInfo = await getSeatById(item.seat_id);

      unit_price = seatInfo.price;
      tier_id = seatInfo.tier_id;
    }

    const subtotal = unit_price * item.quantity;
    total_amount += subtotal;

    orderItems.push({
      zone_id: item.zone_id,
      seat_id: item.seat_id ?? null,
      tier_id,
      quantity: item.quantity,
      unit_price,
    });
  }

  const order_id = await insertOrder({
    user_id,
    concert_id,
    total_amount,
    currency,
    note,
  });

  for (const item of orderItems) {
    await insertOrderItem({
      order_id,
      ...item,
    });
  }

  return {
    order_id,
    total_amount,
    items: orderItems,
  };
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
import { getZoneById } from "../lib/zone";
import { validateSeats, lockSeats, getSeatById } from "../lib/seat";
import { insertOrder, insertOrderItem, getOrderById } from "../lib/order";
import { connectDB } from "../lib/data";
import sql from "mssql";

export type CreateOrderInput = {
  user_id: string;
  concert_id: string;
  items: any[];
  currency: string;
  note?: string;
  wallet_address: string;
};
export async function createOrder(data: CreateOrderInput) {
  const {
    user_id,
    concert_id,
    items,
    currency,
    note,
    wallet_address
  } = data;

  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);

  try {
    for (const item of items) {
      if (!item.quantity || item.quantity <= 0) {
        throw new Error("Quantity must be greater than 0");
      }
    }
    const { total } = await validateSeats(items);


    await transaction.begin();


    await lockSeats(user_id, items, transaction);

    const order_id = await insertOrder(transaction, {
      user_id,
      concert_id,
      total_amount: total,
      currency,
      note,
      wallet_address
    });
    for (const item of items) {
      const req = transaction.request();

      const tier_id = await resolveTier(item, transaction);

      req.input("order_id", order_id);
      req.input("zone_id", item.zone_id);
      req.input("seat_id", item.seat_id || null);
      req.input("quantity", item.quantity);
      req.input("unit_price", item.unit_price || 0);
      req.input("tier_id", tier_id);

      await req.query(`
    INSERT INTO order_items (
      order_id,
      zone_id,
      seat_id,
      quantity,
      unit_price,
      tier_id
    )
    VALUES (
      @order_id,
      @zone_id,
      @seat_id,
      @quantity,
      @unit_price,
      @tier_id
    )
  `);
    }

    await transaction.commit();

    return {
      order_id,
      total_amount: total,
      items
    };

  } catch (error) {
    await transaction.rollback();
    console.error("createOrder error:", error);
    throw error;
  }

}
export async function getSpecificOrder(order_id: string, user_id: string) {
  try {
    const order = await getOrderById(order_id);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.user_id !== user_id) {
      throw new Error("Forbidden - This order does not belong to you");
    }

    return order;

  } catch (error: any) {
    throw new Error(error.message);
  }
}


async function resolveTier(item: any, transaction: any) {
  const zone = await getZoneById(item.zone_id);

  // CASE 1: có seat map
  if (zone.has_seat_map) {
    const seat = await getSeatById(item.seat_id, transaction);

    if (!seat) throw new Error("Seat not found");

    return seat.tier_id;
  }

  // CASE 2: không seat map → tier = zone default tier
  return item.tier_id || null;
}
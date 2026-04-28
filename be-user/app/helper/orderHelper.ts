import { getZoneById } from "../lib/zone";
import { validateSeats,lockSeats, getSeatById } from "../lib/seat";
import { insertOrder, insertOrderItem,getOrderById } from "../lib/order";
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

    // =========================
    // STEP 1: VALIDATE (READ ONLY)
    // =========================
    const { total } = await validateSeats(items);

    // =========================
    // STEP 2: BEGIN TRANSACTION
    // =========================
    await transaction.begin();

    // =========================
    // STEP 3: LOCK SEATS
    // =========================
    await lockSeats(user_id, items, transaction);

    // =========================
    // STEP 4: CREATE ORDER
    // =========================
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

      req.input("order_id", order_id);
      req.input("zone_id", item.zone_id);
      req.input("seat_id", item.seat_id || null);
      req.input("quantity", item.quantity);
      req.input("unit_price", item.unit_price || 0);

      await req.query(`
        INSERT INTO order_items (
          order_id,
          zone_id,
          seat_id,
          quantity,
          unit_price
        )
        VALUES (
          @order_id,
          @zone_id,
          @seat_id,
          @quantity,
          @unit_price
        )
      `);
    }

    // =========================
    // COMMIT
    // =========================
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
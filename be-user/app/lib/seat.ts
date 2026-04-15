import { connectDB } from "./data";
import { getZoneById } from "./zone";
export async function validateZoneBelongsToConcert(
  concert_id: string,
  zone_id: string
): Promise<boolean> {
  const db = await connectDB();

  const result = await db.request()
    .input("concert_id", concert_id)
    .input("zone_id", zone_id)
    .query(`
      SELECT 1
      FROM zones
      WHERE zone_id = @zone_id
        AND concert_id = @concert_id
    `);

  return result.recordset.length > 0;
}

export async function getSeatsByZoneOnly(zone_id: string) {
  const db = await connectDB();

  const result = await db.request()
    .input("zone_id", zone_id)
    .query(`
      SELECT 
        seat_id,
        row_label,
        seat_number,
        seat_label,
        status,
        locked_at,
        locked_by_user_id,
        lock_expires_at,
        created_at
      FROM seats
      WHERE zone_id = @zone_id
        AND status IN ('AVAILABLE', 'LOCKED', 'BOOKED')
      ORDER BY row_label, seat_number
    `);

  return result.recordset;
}

export async function getSeatsWithTier(zone_id: string) {
  const db = await connectDB();

  const result = await db.request()
    .input("zone_id", zone_id)
    .query(`
      SELECT 
        s.seat_id,
        s.row_label,
        s.seat_number,
        s.seat_label,
        s.status,

        z.zone_name,

        t.tier_id,
        t.tier_name,
        t.price

      FROM seats s
      INNER JOIN zones z 
        ON s.zone_id = z.zone_id

      INNER JOIN seat_tiers t 
        ON s.tier_id = t.tier_id

      WHERE s.zone_id = @zone_id
        AND s.status IN ('AVAILABLE', 'LOCKED', 'BOOKED')

      ORDER BY t.display_order, s.row_label, s.seat_number
    `);

  return result.recordset;
}


export async function getSeatById(seat_id: string) {
  const db = await connectDB();

  try {
    const result = await db.request()
      .input("seat_id", seat_id)
      .query(`
        SELECT 
          s.seat_id,
          s.row_label,
          s.seat_number,
          s.seat_label,
          s.status,

          s.zone_id,
          z.zone_name,

          s.tier_id,
          t.tier_name,
          t.price,

          s.locked_at,
          s.locked_by_user_id,
          s.lock_expires_at,
          s.created_at

        FROM seats s

        INNER JOIN zones z 
          ON s.zone_id = z.zone_id

        INNER JOIN seat_tiers t 
          ON s.tier_id = t.tier_id

        WHERE s.seat_id = @seat_id
      `);

    return result.recordset[0] || null;

  } catch (error) {
    console.error("getSeatById error:", error);
    throw error;
  }
}
export async function validateSeats(concert_id: string, items: any[]) {
  const db = await connectDB();

  try {
    for (const item of items) {

      const zone = await getZoneById(item.zone_id);

    
      if (!zone.has_seat_map) {
        if (item.seat_id) {
          throw new Error(`Zone ${item.zone_id} does not accept seat_id`);
        }
        continue;
      }

      if (!item.seat_id) {
        throw new Error(`seat_id required for zone ${item.zone_id}`);
      }

      const request = db.request()
        .input("seat_id", item.seat_id)
        .input("concert_id", concert_id);

      const query = `
        SELECT seat_id
        FROM seats
        WHERE seat_id = @seat_id
        AND concert_id = @concert_id
      `;

      const result = await request.query(query);

      if (result.recordset.length === 0) {
        throw new Error(
          `Seat ${item.seat_id} invalid or not belong to concert`
        );
      }
    }

    return true;

  } catch (error) {
    console.error("validateSeats DB error:", error);
    throw error;
  }
}

export async function lockSeats(user_id: string, items: any[]) {
  const db = await connectDB();

  for (const item of items) {
    const request = db.request()
      .input("seat_id", item.seat_id)
      .input("user_id", user_id);

    const result = await request.query(`
      UPDATE seats
      SET 
        status = 'LOCKED',
        locked_by_user_id = @user_id,
        locked_at = GETDATE(),
        lock_expires_at = DATEADD(MINUTE, 10, GETDATE())
      WHERE seat_id = @seat_id
        AND status = 'AVAILABLE'
    `);

    if (result.rowsAffected[0] === 0) {
      throw new Error(`Seat ${item.seat_id} already locked or booked`);
    }
  }
}
export async function markSeatsBookedByOrder(
  order_id: string,
  transaction?: any
) {
  try {
    const request = transaction
      ? transaction.request()
      : (await connectDB()).request();

    await request.input("order_id", order_id).query(`
      UPDATE s
      SET 
        s.status = 'BOOKED',
        s.locked_by_user_id = NULL,
        s.locked_at = NULL,
        s.lock_expires_at = NULL
      FROM seats s
      INNER JOIN order_items oi 
        ON s.seat_id = oi.seat_id
      WHERE oi.order_id = @order_id
        AND s.status IN ('LOCKED', 'AVAILABLE')
    `);
  } catch (error) {
    console.error("markSeatsBookedByOrder error:", error);
    throw new Error("Failed to mark seats BOOKED");
  }
}
export async function lockSingleSeat(
  seat_id: string,
  user_id: string,
  order_id: string
) {
  const db = await connectDB();

  try {
    const request = db.request()
      .input("seat_id", seat_id)
      .input("user_id", user_id)
      .input("order_id", order_id);

    const result = await request.query(`
      UPDATE seats
      SET 
        status = 'LOCKED',
        locked_by_user_id = @user_id,
        locked_at = GETDATE(),
        lock_expires_at = DATEADD(MINUTE, 10, GETDATE())
      WHERE seat_id = @seat_id
        AND status = 'AVAILABLE'
    `);

    if (result.rowsAffected[0] === 0) {
      throw new Error(`Seat ${seat_id} is already locked or booked`);
    }

    return true;

  } catch (error: any) {
    console.error("lockSingleSeat error:", {
      seat_id,
      user_id,
      order_id,
      error: error.message,
    });

    throw new Error(
      `Failed to lock seat ${seat_id}: ${error.message}`
    );
  }
}

export async function unlockSeat(seat_id: string) {
  const db = await connectDB();

  try {
    const result = await db.request()
      .input("seat_id", seat_id)
      .query(`
        UPDATE seats
        SET 
          status = 'AVAILABLE',
          locked_by_user_id = NULL,
          locked_at = NULL,
          lock_expires_at = NULL
        WHERE seat_id = @seat_id
          AND status = 'LOCKED'
      `);

    return result.rowsAffected[0] > 0;

  } catch (error: any) {
    console.error("unlockSeat error:", {
      seat_id,
      error: error.message,
    });

    throw new Error(
      `Failed to unlock seat ${seat_id}: ${error.message}`
    );
  }
}
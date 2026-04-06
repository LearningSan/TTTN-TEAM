import { connectDB } from "./data";

export async function getSeatsByZoneIdandConcertId(
  concert_id: string,
  zone_id: string
) {
  const db = await connectDB();

  try {
    const request = db.request()
      .input("concert_id", concert_id)
      .input("zone_id", zone_id);

    const query = `
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
      WHERE concert_id = @concert_id 
        AND zone_id = @zone_id
        AND status IN ('AVAILABLE', 'LOCKED', 'BOOKED')
      ORDER BY row_label, seat_number
    `;

    const result = await request.query(query);
    return result.recordset;

  } catch (error) {
    console.error("getSeatsByZone error:", error);
    throw error;
  }
}

export async function getSeatById(seat_id: string) {
  const db = await connectDB();

  try {
    const result = await db.request()
      .input("seat_id", seat_id)
      .query(`
        SELECT 
          seat_id,
          zone_id,
          concert_id,
          row_label,
          seat_number,
          seat_label,
          status,
          locked_at,
          locked_by_user_id,
          lock_expires_at,
          created_at
        FROM seats
        WHERE seat_id = @seat_id
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
        throw new Error("Seat invalid or not belong to concert");
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

    const query = `
      UPDATE seats
      SET 
        status = 'LOCKED',
        locked_by_user_id = @user_id,
        locked_at = GETDATE(),
        lock_expires_at = DATEADD(MINUTE, 15, GETDATE())
      WHERE seat_id = @seat_id
      AND (
        status = 'AVAILABLE'
        OR (
          status = 'LOCKED'
          AND lock_expires_at < GETDATE()
        )
      )
    `;

    const result = await request.query(query);

    if (result.rowsAffected[0] === 0) {
      throw new Error("Seat already locked or sold");
    }
  }
}
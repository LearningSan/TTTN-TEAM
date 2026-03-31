import { connectDB } from "./data";

export async function getSeatsByZone(
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
        seat_id, row_label, seat_number, seat_label, status,
        locked_at, locked_by_user_id, lock_expires_at, created_at
      FROM seats
      WHERE concert_id = @concert_id AND zone_id = @zone_id
      ORDER BY row_label, seat_number
    `;

    const result = await request.query(query);
    return result.recordset;

  } catch (error) {
    console.error("getSeatsByZone error:", error);
    throw error;
  }
}
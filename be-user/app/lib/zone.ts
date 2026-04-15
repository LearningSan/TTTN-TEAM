import { connectDB } from "./data";
import type {zones} from "./defination";
export async function getZoneById(zone_id: string): Promise<zones> {
  const db = await connectDB();

  try {
    if (!zone_id) {
      throw new Error("zone_id is required");
    }

    const request = db.request().input("zone_id", zone_id);

    const query = `
      SELECT 
        zone_id,
        concert_id,
        zone_name,
        description,
        price,
        currency,
        total_seats,
        available_seats,
        sold_seats,
        color_code,
        has_seat_map,
        display_order,
        status,
        created_at,
        updated_at
      FROM zones
      WHERE zone_id = @zone_id
    `;

    const result = await request.query(query);

    if (!result.recordset || result.recordset.length === 0) {
      throw new Error(`Zone not found: ${zone_id}`);
    }

    return result.recordset[0] as zones;

  } catch (error) {
    console.error("getZoneById error:", error);
    throw error;
  }
}
export async function getZonesByConcertId(concert_id: string) {
  const db = await connectDB();

  try {
    const request = db.request()
      .input("concert_id", concert_id);

    const result = await request.query(`
      SELECT 
        zone_id,
        concert_id,
        zone_name,
        description,
        price,
        currency,
        total_seats,
        available_seats,
        sold_seats,
        color_code,
        has_seat_map,
        display_order,
        status,
        created_at,
        updated_at
      FROM zones
      WHERE concert_id = @concert_id
        AND status = 'ACTIVE'
      ORDER BY display_order ASC
    `);

    return result.recordset;

  } catch (error) {
    console.error("DB getZonesByConcertId error:", error);
    throw new Error("Database error while fetching zones");
  }
}

export async function lockZoneCapacityV2(
  zone_id: string,
  quantity: number,
  order_id: string
) {
  const db = await connectDB();

  try {
    const request = db.request()
      .input("zone_id", zone_id)
      .input("quantity", quantity)
      .input("order_id", order_id);

    // 🔥 atomic update chống oversell
    const result = await request.query(`
      UPDATE zones
      SET 
        available_seats = available_seats - @quantity,
        sold_seats = sold_seats + @quantity
      WHERE zone_id = @zone_id
        AND available_seats >= @quantity
    `);

    if (result.rowsAffected[0] === 0) {
      throw new Error(
        `Not enough tickets available in zone ${zone_id}`
      );
    }

    // 🧾 insert hold record (rollback support)
    // await db.request()
    //   .input("zone_id", zone_id)
    //   .input("quantity", quantity)
    //   .input("order_id", order_id)
    //   .query(`
    //     INSERT INTO zone_holds(zone_id, quantity, order_id, status, expires_at)
    //     VALUES (@zone_id, @quantity, @order_id, 'HELD', DATEADD(MINUTE, 10, GETDATE()))
    //   `);

    return true;

  } catch (error: any) {
    console.error("lockZoneCapacityV2 error:", {
      zone_id,
      quantity,
      order_id,
      error: error.message,
    });

    throw new Error(
      `Failed to lock zone ${zone_id}: ${error.message}`
    );
  }
}
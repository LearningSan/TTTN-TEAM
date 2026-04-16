import { connectDB } from "./data";

export async function validateZoneHasSeatMap(zone_id: string): Promise<boolean> {
  const db = await connectDB();

  const result = await db.request()
    .input("zone_id", zone_id)
    .query(`
      SELECT has_seat_map
      FROM zones
      WHERE zone_id = @zone_id
    `);

  if (!result.recordset.length) return false;

  return result.recordset[0].has_seat_map === true;
}

export async function getSeatTiersByZoneId(zone_id: string) {
  const db = await connectDB();

  const result = await db.request()
    .input("zone_id", zone_id)
    .query(`
      SELECT 
        tier_id,
        tier_name,
        price,
        currency,
        color_code,
        description,
        display_order
      FROM seat_tiers
      WHERE zone_id = @zone_id
      ORDER BY display_order ASC
    `);

  return result.recordset;
}
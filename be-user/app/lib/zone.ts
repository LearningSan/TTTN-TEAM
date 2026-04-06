import { connectDB } from "./data";
export async function getZonePrice(zone_id: string): Promise<number> {
  const db = await connectDB();

  try {
    const request = db.request().input("zone_id", zone_id);

    const query = `
      SELECT price
      FROM zones
      WHERE zone_id = @zone_id
    `;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      throw new Error("Zone not found");
    }

    return result.recordset[0].price;

  } catch (error) {
    console.error("getZonePrice DB error:", error);
    throw error;
  }
}
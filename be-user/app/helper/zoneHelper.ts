import { getZonesByConcertId,getZoneById } from "../lib/zone";
import type { zones } from "../lib/defination";

export async function getZones(concert_id: string) {
  try {
    if (!concert_id) {
      throw new Error("concert_id is required");
    }

    const zones = await getZonesByConcertId(concert_id);

    if (!zones || zones.length === 0) {
      return [];
    }

  
    return zones;

  } catch (error: any) {
    console.error("Helper getZones error:", error);

    throw new Error(
      error?.message || "Failed to get zones"
    );
  }
}
export async function getSpecificZone(zone_id: string): Promise<zones> {
  try {
    if (!zone_id) {
      throw new Error("zone_id is required");
    }

    const zone = await getZoneById(zone_id);

    if (!zone) {
      throw new Error(`Zone not found: ${zone_id}`);
    }

    return zone as zones;

  } catch (error) {
    console.error("getZoneById helper error:", error);
    throw error;
  }
}
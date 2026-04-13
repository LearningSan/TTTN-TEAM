import { validateZoneHasSeatMap,getSeatTiersByZoneId} from "../lib/seat-tier";

export async function getSeatTiersByZone(zone_id: string) {
  if (!zone_id) throw new Error("zone_id is required");

  const isValid = await validateZoneHasSeatMap(zone_id);

  if (!isValid) {
    throw new Error("Zone does not support seat tiers (no seat map)");
  }

  return await getSeatTiersByZoneId(zone_id);
}
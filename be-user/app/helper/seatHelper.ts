import { validateZoneBelongsToConcert,getSeatsByZoneOnly,getSeatById,getSeatsWithTier} from "../lib/seat";


export async function getSeatsByZone(concert_id: string, zone_id: string) {
  if (!concert_id) throw new Error("concert_id is required");
  if (!zone_id) throw new Error("zone_id is required");

  const isValid = await validateZoneBelongsToConcert(concert_id, zone_id);

  if (!isValid) {
    throw new Error("Zone does not belong to this concert");
  }

  return await getSeatsByZoneOnly(zone_id);
}

export async function getSeatsGroupedByTier(
  concert_id: string,
  zone_id: string
) {
  if (!concert_id) throw new Error("concert_id is required");
  if (!zone_id) throw new Error("zone_id is required");

  const isValid = await validateZoneBelongsToConcert(concert_id, zone_id);
  if (!isValid) {
    throw new Error("Zone does not belong to this concert");
  }

  const rows = await getSeatsWithTier(zone_id);

  const grouped: Record<string, any[]> = {};

  for (const row of rows) {
    if (!grouped[row.tier_name]) {
      grouped[row.tier_name] = [];
    }

    grouped[row.tier_name].push({
      seat_id: row.seat_id,
      seat_label: row.seat_label,
      row_label: row.row_label,
      seat_number: row.seat_number,
      status: row.status,

      zone_name: row.zone_name,

      tier_id: row.tier_id,
      tier_name: row.tier_name,
      price: row.price
    });
  }

  return grouped;
}

export async function getSpecificSeat(seat_id: string) {
  if (!seat_id) {
    throw new Error("seat_id is required");
  }

  return await getSeatById(seat_id);
}
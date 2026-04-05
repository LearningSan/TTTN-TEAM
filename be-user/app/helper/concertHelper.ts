import { getConcertList,getConcertById } from "../lib/concert";
import { getSeatsByZoneIdandConcertId,getSeatById } from "../lib/seat";

type GetAllParams = {
  artist?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

type GetDetailParams = {
  concert_id: string;
};

export async function getAll(params: GetAllParams) {
  try {
    const result = await getConcertList(
      { artist: params.artist, status: params.status },
      params.page,
      params.pageSize
    );
    return result;
  } catch (error: any) {
    console.error("getAll service error:", error);
    throw new Error(error.message || "Failed to fetch concert list");
  }
}

export async function getDetail(params: GetDetailParams) {
  try {
    const result = await getConcertById(params.concert_id);
    return result;
  } catch (error: any) {
    console.error("getDetail service error:", error);
    throw new Error(error.message || "Failed to fetch concert detail");
  }
}


export async function getSeats(concert_id: string,zone_id: string) {
  if (!concert_id) {
    throw new Error("concert_id is required");
  }
  if (!zone_id) {
    throw new Error("zone_id is required");
  }

  return await getSeatsByZoneIdandConcertId(concert_id, zone_id);
}

export async function getSpecificSeat(seat_id: string) {
  if (!seat_id) {
    throw new Error("seat_id is required");
  }

  return await getSeatById(seat_id);
}
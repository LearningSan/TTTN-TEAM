import { getConcertList,getConcertById } from "../lib/concert";

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


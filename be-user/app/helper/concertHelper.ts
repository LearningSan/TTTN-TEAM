import { getConcertList,getConcertById } from "../lib/concert";
import { searchConcertByKeyword } from "../lib/concert";

type GetAllParams = {
  title?: string;
  artist?: string;
  city?: string;
  date?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

type GetDetailParams = {
  concert_id: string;
};

export async function search(params: {
  keyword: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    return await searchConcertByKeyword(
      params.keyword,
      params.page,
      params.pageSize
    );
  } catch (error: any) {
    console.error("❌ search helper error:", error);
    throw error;
  }
}
export async function getAll(params: GetAllParams) {
  try {
   return await getConcertList(
    {
      title: params.title,
      artist: params.artist,
      city: params.city,
      date: params.date,
      status: params.status
    },
    params.page,
    params.pageSize
  );
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


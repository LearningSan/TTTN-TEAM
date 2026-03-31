import { NextRequest, NextResponse } from "next/server";
import { getAll } from "@/app/helper/concertHelper";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const artist = url.searchParams.get("artist") || undefined;
    const status = url.searchParams.get("status") || undefined;
    const page = url.searchParams.get("page") ? Number(url.searchParams.get("page")) : 1;
    const pageSize = url.searchParams.get("pageSize") ? Number(url.searchParams.get("pageSize")) : 10;

    const result = await getAll({ artist, status, page, pageSize });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
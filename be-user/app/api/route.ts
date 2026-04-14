import { NextRequest,NextResponse } from "next/server";

export async function GET(requestt:Request) {
    const results={
        message:'Hello world'
    }
    return NextResponse.json(results)
}
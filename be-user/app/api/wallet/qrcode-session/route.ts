import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST() {
  try {
    const session_id = randomUUID();

    return NextResponse.json({
      success: true,
      session_id,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
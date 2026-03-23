import { NextRequest,NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getUser } from "@/app/lib/user";


export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  const user = await getUser(email);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 401 });
  }
  if (!user || !user.password_hash) return null;

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return NextResponse.json({ message: "Wrong password" }, { status: 401 });
  }

  // trả về dữ liệu hoặc token
  return NextResponse.json({
    message: "Login success",
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  });
}
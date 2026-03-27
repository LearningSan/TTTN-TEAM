import { NextRequest,NextResponse } from "next/server";
import { verifyToken } from "@/app/helper/authenHelper";
import { getUser } from "@/app/lib/user";
import { sanitizeUser } from "@/app/helper/authenHelper";
export async function GET(req:NextRequest) {
  const token = req.cookies.get("access_token")?.value;
console.log(token)
  if (!token) {
    return NextResponse.json({ user: null });
  }

  // decode token
  const user =await verifyToken(token);
  let userFromDb
if(user!=null)
 userFromDb = await getUser(user.email); 
if (!userFromDb) return NextResponse.json({ user: null });

return NextResponse.json(sanitizeUser(userFromDb));
}
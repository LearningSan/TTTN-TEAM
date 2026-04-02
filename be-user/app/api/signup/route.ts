/**
 * @swagger
 * /api/signup:
 *   post:
 *     summary: Đăng ký tài khoản bằng email + password + name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             email: admin@gmail.com
 *             password: 123
 *             name: tryit
 *     responses:
 *       200:
 *         description: OK
 */

import { NextRequest,NextResponse } from "next/server";
import { createUser } from "@/app/lib/user";
import { sanitizeUser } from "@/app/helper/authenHelper";

export async function POST(req:Request) {
  try{
    const data=await req.json()

  const newUser = await createUser(data.email, data.password, data.name);
if (newUser) {
   return NextResponse.json(await sanitizeUser(newUser) );
} else {
   return NextResponse.json({ message: "User already exists" }, { status: 400 });
}}
catch(error){
    console.error("Failed to create user", error);
    return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
}
}
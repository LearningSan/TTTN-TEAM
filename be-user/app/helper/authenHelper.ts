// authHelper.ts
import bcrypt from "bcrypt";
import { getUser } from "@/app/lib/user";
import jwt from "jsonwebtoken";
import { createVerifytoken,getListTokenNull,Updatetoken,deleteVerifyToken } from "../lib/verify_token";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; 

export async function authenticateUser(email: string, password: string) {
  const user = await getUser(email);
  if (!user || !user.password_hash) return null;
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return null;

  return {
    id: user.user_id,
    name: user.name,
    email: user.email,
  };
}

export async function createToken(
  user: { id: string; email: string; name: string },
  deviceInfo: string = "unknown",
  ipAddress: string = "0.0.0.0"
) {

  if (!user.id) throw new Error("User ID is required");

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace("T", " ");

  const tokenHash = await bcrypt.hash(token, 10);

  const result = await createVerifytoken(user.id, tokenHash, deviceInfo, ipAddress, expiresAtStr);

  if (!result) return null;

  return token;
}
export async function refreshToken(oldToken: string) {
  const [rows] =await getListTokenNull()

  const session = rows.find((r: any) => bcrypt.compareSync(oldToken, r.token_hash));

  if (!session) throw new Error("Token invalid or revoked");

  const now = new Date();
  if (now > session.expires_at) throw new Error("Token expired");

  const newToken = jwt.sign({ id: session.user_id }, JWT_SECRET);
  const tokenHash = await bcrypt.hash(newToken, 10);
  const newExpiresAt = new Date();
  newExpiresAt.setHours(newExpiresAt.getHours() + 1);
      const newExpiresAtStr = newExpiresAt.toISOString().slice(0, 19).replace('T', ' ');

if(!Updatetoken(tokenHash, newExpiresAtStr, session.token_id))
  return null
  

  return newToken;
}
export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
export async function  deleteToken(token:string) {
  try{
    deleteVerifyToken(token)
  }catch(error){
    console.error("Failed to delete token")
  }
}
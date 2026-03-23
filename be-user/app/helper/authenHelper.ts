// authHelper.ts
import bcrypt from "bcrypt";
import { getUser } from "@/app/lib/user";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret"; 

export async function authenticateUser(email: string, password: string) {
  const user = await getUser(email);

  if (!user || !user.password_hash) return null;

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

export function createToken(user: { id: string; email: string; name: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
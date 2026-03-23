import { connectDB } from './data';
import bcrypt from 'bcrypt'
import type { refresh_token } from './defination';
import { error } from 'console';

const db=await connectDB()


export async function createVerifytoken(
  id: string,
  tokenHash: string,
  deviceInfo?: string,
  ipAddress?: string,
  expiresAt?: string
) {
  if (!id || !tokenHash) {
    throw new Error("id and tokenHash are required");
  }

  const device = deviceInfo ?? null;
  const ip = ipAddress ?? null;
  const expires = expiresAt ?? null;

  const [result] = await db.execute(
    `INSERT INTO refresh_tokens (user_id, token_hash, device_info, ip_address, expires_at)
     VALUES (?, ?, ?, ?, ?)`,
    [id, tokenHash, device, ip, expires]
  );

  return result; // will be RowDataPacket or ResultSetHeader
}
export async function getListTokenNull() {
     const [rows]: any = await db.execute(
    `SELECT * FROM refresh_tokens WHERE revoked_at IS NULL`
  );
  return [rows]
}
export async function Updatetoken(tokenHash:string, newExpiresAt:string, id:string) {

  const expires = newExpiresAt ?? null;
    return   await db.execute(
    `UPDATE refresh_tokens SET token_hash = ?, expires_at = ? WHERE token_id = ?`,
    [tokenHash, expires, id]
  );
}
export async function deleteVerifyToken(token:string) {
    if (token) {
    const [rows]: any = await db.execute("SELECT token_hash FROM refresh_tokens");

    for (const row of rows) {
      const match = await bcrypt.compare(token, row.token_hash);
      if (match) {
        await db.execute("DELETE FROM refresh_tokens WHERE token_hash = ?", [row.token_hash]);
        break; 
      }
    }
  }
    else
        throw error("There is no token given")
}
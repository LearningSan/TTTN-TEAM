import { connectDB } from './data';
import bcrypt from "bcrypt"
export async function createVerifytoken(
  id: string,
  tokenHash: string,
  deviceInfo?: string,
  ipAddress?: string,
  expiresAt?: string
) {
  try {
    if (!id || !tokenHash) {
      throw new Error("id and tokenHash are required");
    }

    const db = await connectDB();

    const result = await db.request()
      .input("user_id", id)
      .input("token_hash", tokenHash)
      .input("device_info", deviceInfo ?? null)
      .input("ip_address", ipAddress ?? null)
      .input("expires_at", expiresAt ?? null)
      .query(`
        INSERT INTO refresh_tokens 
        (user_id, token_hash, device_info, ip_address, expires_at)
        VALUES (@user_id, @token_hash, @device_info, @ip_address, @expires_at)
      `);

    return result;

  } catch (error) {
    console.error("createVerifytoken error:", error);
    throw error;
  }
}

export async function getTokenByUserId(userId: string) {
  try {
    const db = await connectDB();

   const result = await db.request()
  .input("user_id", userId)
  .query(`
    SELECT TOP 1 * 
    FROM refresh_tokens
    WHERE user_id = @user_id
    ORDER BY created_at DESC
  `);

    return result.recordset[0];

  } catch (error) {
    console.error(" getTokenByUserId", error);
    throw error;
  }
}

export async function updateVerifyTokenByTokenId( token_id: string) {
  try {
    const db = await connectDB();

    const result = await db.request()
      .input("token_id", token_id)
      .query(`
        UPDATE refresh_tokens 
        SET revoked_at = GETDATE()
        WHERE token_id = @token_id
      `);

    return result;

  } catch (error) {
    console.error("Updatetoken error:", error);
    throw error;
  }
}
export async function revokeUserTokens(userId: string) {
      const db = await connectDB();

  try {
    await db.request()
      .input("user_id", userId)
      .query(`
        UPDATE refresh_tokens
        SET revoked_at = GETDATE()
        WHERE user_id = @user_id
          AND revoked_at IS NULL
      `);
    
    console.log(`All tokens for user ${userId} have been revoked.`);
  } catch (err) {
    console.error(`Failed to revoke tokens for user ${userId}:`, err);
    throw new Error("Cannot revoke user tokens");
  }
}
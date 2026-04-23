import { connectDB } from "./data";
import type { email_verifications } from "./defination";


export async function createEmailVerification(
  user_id: string,
  token: string,
  expires_at: Date
) {
  try {
    const db = await connectDB();

    await db.request()
      .input("verify_id", crypto.randomUUID())
      .input("user_id", user_id)
      .input("token", token)
      .input("expires_at", expires_at)
      .query(`
        INSERT INTO email_verifications (
          verify_id,
          user_id,
          token,
          expires_at,
          created_at
        )
        VALUES (
          @verify_id,
          @user_id,
          @token,
          @expires_at,
          GETDATE()
        )
      `);

  } catch (error) {
    console.error("createEmailVerification error:", error);
    throw new Error("Failed to create email verification");
  }
}

export async function getVerificationByToken(
  token: string
): Promise<email_verifications | null> {
  try {
    const db = await connectDB();

    const result = await db
      .request()
      .input("token", token)
      .query(`
        SELECT * 
        FROM email_verifications
        WHERE token = @token
      `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("getVerificationByToken error:", error);
    throw new Error("Failed to get verification");
  }
}

export async function markVerificationUsed(verify_id: string) {
  try {
    const db = await connectDB();

    await db
      .request()
      .input("verify_id", verify_id)
      .query(`
        UPDATE email_verifications
        SET used_at = GETDATE()
        WHERE verify_id = @verify_id
      `);
  } catch (error) {
    console.error("markVerificationUsed error:", error);
    throw new Error("Failed to update verification");
  }
}

export async function verifyUserEmail(user_id: string) {
  try {
    const db = await connectDB();

    await db
      .request()
      .input("user_id", user_id)
      .query(`
        UPDATE users
        SET email_verified = 1
        WHERE user_id = @user_id
      `);
  } catch (error) {
    console.error("verifyUserEmail error:", error);
    throw new Error("Failed to verify user email");
  }
}
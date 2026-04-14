import { connectDB } from "./data";

export async function createPassword_Reset(
  user_id: string,
  otp: string
) {
  const db = await connectDB();

  try {
    await db.request()
      .input("user_id", user_id)
      .input("token", otp)
      .query(`
        INSERT INTO password_resets (user_id, token, expires_at)
        VALUES (
          @user_id, 
          @token, 
          DATEADD(HOUR, 7, DATEADD(MINUTE, 5, GETUTCDATE()))
        )
      `);

    return { message: "OTP created" };

  } catch (error) {
    console.error("createPassword_Reset error:", error);
    throw error;
  }
}

export async function checkOTP(user_id: string, otp: string) {
  const db = await connectDB();

  const result = await db.request()
    .input("user_id", user_id)
    .input("token", otp)
    .query(`
      SELECT TOP 1 *
      FROM password_resets
      WHERE user_id = @user_id
        AND token = @token
        AND used_at IS NULL
        AND expires_at > GETDATE()
      ORDER BY created_at DESC
    `);
  if (result.recordset.length === 0) {
    return { success: false, message: "OTP không hợp lệ hoặc hết hạn" };
  }

  const record = result.recordset[0];

  await db.request()
    .input("reset_id", record.reset_id)
    .query(`
      UPDATE password_resets
      SET used_at = GETDATE()
      WHERE reset_id = @reset_id
    `);

  return { success: true };
}
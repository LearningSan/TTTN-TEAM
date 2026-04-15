import type { users } from './defination';
import { connectDB } from './data';
import bcrypt from 'bcrypt';


export async function getUser(email: string): Promise<users | undefined> {
  try {
    const db = await connectDB();

    const result = await db.request()
      .input("email", email)
      .query(`
        SELECT * 
        FROM users 
        WHERE email = @email
      `);

    return result.recordset[0] as users | undefined;

  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function createUser(
  email: string,
  password: string | null,
  name: string,
  avatar_url?: string 
): Promise<users | null> {
  try {
    const existingUser = await getUser(email);
    if (existingUser) return null;

    let password_hash: string | null = null;

    if (password) {
      password_hash = await bcrypt.hash(password, 10);
    }

    const db = await connectDB();

    await db.request()
      .input("email", email)
      .input("password_hash", password_hash)
      .input("name", name)
      .input("avatar_url", avatar_url ?? null) 
      .query(`
        INSERT INTO users (email, password_hash, name, avatar_url) 
        VALUES (@email, @password_hash, @name, @avatar_url)
      `);

    const user = await getUser(email);
    return user ?? null;

  } catch (error) {
    console.error('Failed to create new user', error);
    throw new Error('Failed to create new user');
  }
}
export async function activateUser(userId: string): Promise<void> {
  try {
    const db = await connectDB();

    await db.request()
      .input("user_id", userId)
      .query(`
        UPDATE users
        SET status = 'ACTIVE',
            email_verified = 1
        WHERE user_id = @user_id
          AND (status <> 'ACTIVE' OR email_verified <> 1)
      `);

  } catch (error) {
    console.error("Failed to activate user", error);
    throw new Error("Failed to activate user");
  }
}
export async function updatePassword(user_id: string, password_hash: string) {
  const db = await connectDB();

  return await db.request()
    .input("user_id", user_id)
    .input("password_hash", password_hash)
    .query(`
      UPDATE users
      SET password_hash = @password_hash
      WHERE user_id = @user_id
    `);
}
export async function updateWalletAddress(user_id: string, wallet_address: string) {
  try {
    const db = await connectDB();

    const request = db.request()
      .input("user_id", user_id)
      .input("wallet_address", wallet_address);

    const result = await request.query(`
      UPDATE users
      SET wallet_address = @wallet_address,
          updated_at = GETDATE()
      WHERE user_id = @user_id
    `);

    return result;
  } catch (error: any) {
    console.error("updateWalletAddress error:", error);
    throw new Error("FAILED_TO_UPDATE_WALLET_ADDRESS");
  }
}
import { connectDB } from './data';

export async function findSocial(provider: string, provider_id: string) {
  try {
    const db = await connectDB();

    const result = await db.request()
      .input("provider", provider)
      .input("provider_id", provider_id)
      .query(`
        SELECT * 
        FROM social_accounts 
        WHERE provider = @provider 
        AND provider_id = @provider_id
      `);

    return result.recordset[0];

  } catch (err: any) {
    console.error("findSocial error:", err.message);
    throw err;
  }
}

export async function createSocial(
  user_id: string,
  provider: string,
  provider_id: string,
  provider_email?: string,
) {
  const db = await connectDB();

  await db.request()
    .input("user_id", user_id)
    .input("provider", provider)
    .input("provider_id", provider_id)
    .input("provider_email", provider_email)
    .query(`
      INSERT INTO social_accounts 
      (user_id, provider, provider_id, provider_email,  linked_at)
      VALUES (@user_id, @provider, @provider_id, @provider_email, GETDATE())
    `);
}
export async function findSocialByUserId(user_id:string){
try {
    const db = await connectDB();

    const result = await db.request()
      .input("user_id", user_id)
      .query(`
        SELECT provider
        FROM social_accounts 
        WHERE user_id = @user_id
      `);

    return result.recordset[0]?.provider || null;

  } catch (err: any) {
    console.error("findSocial error:", err.message);
    throw err;
  }
}
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

export async function connectDB() {
  try {
    const pool = await sql.connect({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      server: process.env.DB_SERVER!,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT),

      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    });

    return pool;

  } catch (error) {
    console.error("DB Connection Error:", error);
    throw error;
  }
}
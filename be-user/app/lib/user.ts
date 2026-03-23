import { RowDataPacket } from 'mysql2';
import type { users } from './defination';
import { connectDB } from './data';

const db=await connectDB()
export async function  getUser(email:string):Promise<users | undefined> {
    try {   
  const sql = await connectDB();

    // Use ? placeholder to prevent SQL injection
    const [rows] = await sql.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    // Cast the first row to User type
    const user = rows[0] as users | undefined;
    return user;
    } catch (error) {
     console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');    }
}


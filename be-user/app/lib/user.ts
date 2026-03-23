import { RowDataPacket,ResultSetHeader } from 'mysql2';
import type { users } from './defination';
import { connectDB } from './data';
import bcrypt from 'bcrypt'
const db=await connectDB()
export async function  getUser(email:string):Promise<users | undefined> {
    try {   

    // Use ? placeholder to prevent SQL injection
    const [rows] = await db.execute<RowDataPacket[]>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    // Cast the first row to User type
    const user = rows[0] as users | undefined;
    return user;
    } catch (error) {
     console.error('Failed to fetch user:',error);
    throw new Error('Failed to fetch user.');    }
}

export async function createUser(email: string, password: string, name: string): Promise<users | null> {
  try {
    const existingUser = await getUser(email);
    if (existingUser) return null;

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
      [email, password_hash, name]
    );

    const user = await getUser(email);
    return user ?? null    

  } catch (error) {
    console.error('Failed to create new user', error);
    throw new Error('Failed to create new user');
  }
}
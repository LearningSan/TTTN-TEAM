
export type users = {
  id: string;           
  name: string;             
  email: string;            
  password_hash?: string;   
  avatar_url?: string;       
  phone?: string;           
  wallet_address?: string;   
  role: 'USER' | 'ADMIN';    
  status: 'UNVERIFIED' | 'ACTIVE' | 'BANNED'; 
  email_verified: boolean;  
  created_at: string;       
  updated_at: string;      
};
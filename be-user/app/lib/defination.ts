
export type users = {
  user_id: string;           
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

export type refresh_token = {
  token_id: string;                 // token_id
  user_id: string;            
  token_hash: string;         
  device_info?: string;       
  ip_address?: string;        
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  expires_at: string;         
  revoked_at?: string;        
  created_at: string;         
  updated_at: string;         
};
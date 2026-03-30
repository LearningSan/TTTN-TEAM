
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
  token_id: string;               
  token_hash: string;         
  device_info?: string;       
  ip_address?: string;        
  expires_at: string;         
  revoked_at?: string;        
  created_at: string;         
};
export type social_account = {
  social_id: string;
  user_id: string;
  provider: string;
  provider_id: string;         
  provider_email?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  linked_at: string;
 
};

export type password_resets ={
  reset_id :string,
  user_id:string,
  token:string,
  expires_at:string,
  used_at: string,
  created_at:string
}
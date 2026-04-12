
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
  user_id: string; 
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
export type password_resets = {
  reset_id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};
export type email_verifications = {
  verify_id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};
export type zones = {
  zone_id: string,          
  concert_id: string,       
  zone_name: string,        
  description: string | null, 
  price: number,            
  currency: string,         
  total_seats: number,      
  available_seats: number,   
  sold_seats: number,       
  color_code: string | null,
  has_seat_map: boolean,    
  display_order: number,    
  status: string,            
  created_at: string,       
  updated_at: string        
};
export type concerts = {
  concert_id: string,      
  organizer_id: string,     
  venue_id: string,       
  title: string,          
  artist: string,          
  concert_date: string,    
  end_date: string | null,  
  description: string | null, 
  banner_url: string | null, 
  sale_start_at: string | null, 
  sale_end_at: string | null,  
  status: string,          
  created_at: string,       
  updated_at: string       
};

export type venues = {
  venue_id: string,       
  name: string,          
  address: string | null,
  city: string | null,    
  district: string | null,
  country: string,       
  capacity: number | null,
  created_at: string,    
  updated_at: string     
};

export type seats = {
  seat_id: string,               
  zone_id: string,               
  concert_id: string,            
  row_label: string,             
  seat_number: number,           
  seat_label: string,            
  status: string,                 
  locked_at: string | null,      
  locked_by_user_id: string | null,
  lock_expires_at: string | null, 
  created_at: string             
  tier_id: string | null
};

export type seat_tiers = {
  tier_id: string;         
  zone_id: string;         
  concert_id: string;       
  tier_name: string;        
  price: number;           
  currency: string;        
  color_code: string | null; 
  description: string | null; 
  display_order: number;   
  created_at: string;      
  updated_at: string;      
};
export type order = {
  order_id: string,
  user_id: string,
  concert_id: string,
  total_amount: number,
  currency: string,
  order_status: string,
  wallet_address: string | null,
  payment_id: string | null,
  note: string | null,
  created_at: string,
  expires_at: string,
  paid_at: string | null,
  updated_at: string
};
export type order_item = {
  order_item_id: string;
  order_id: string;
  zone_id: string;
  seat_id: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number; // quantity * unit_price
  tier_id:string | null;
};
export type tickets = {
  ticket_id: string;
  order_id: string;
  order_item_id: string;
  user_id: string;
  concert_id: string;
  zone_id: string;
  seat_id: string | null;
  payment_id: string;
  token_id: string | null;
  wallet_address: string
  mint_tx_hash: string | null;
  contract_address: string | null;
  qr_code: string | null;
  qr_url: string | null;
  status: string;
  purchase_date: string;
  used_at: string | null;
  created_at: string;
  updated_at: string;
};
export type payment_transactions = {
  payment_id: string;
  order_id: string;
  user_id: string;
  concert_id: string;
  amount: number;
  currency: string;
  from_wallet: string;
  to_wallet: string;
  transaction_hash: string | null;
  block_number: number | null;
  payment_status: string;
  failure_reason: string | null;
  confirmed_at: string | null;
  retry_count: number;
  created_at: string;
  updated_at: string;
};

export type transfer_transactions = {
  transfer_id: string;
  ticket_id: string;
  from_user_id: string;
  to_user_id: string;
  from_wallet: string;
  to_wallet: string;
  transaction_hash: string | null;
  transfer_status: string;
  transfer_date: string;
  confirmed_at: string | null;
};
export type withdraw_transactions = {
  withdraw_id: string;
  admin_id: string;
  amount: number;
  currency: string;
  from_wallet: string;
  to_wallet: string;
  transaction_hash: string | null;
  withdraw_status: string;
  note: string | null;
  created_at: string;
  confirmed_at: string | null;
};
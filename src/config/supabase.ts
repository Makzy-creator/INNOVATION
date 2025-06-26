import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Database schema types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'donor' | 'recipient' | 'admin';
  blood_type?: string;
  location?: string;
  phone?: string;
  wallet_address?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface TransactionHistory {
  id: string;
  user_id: string;
  transaction_hash: string;
  transaction_type: 'donation' | 'request' | 'fulfillment';
  amount?: number;
  blood_type?: string;
  status: 'pending' | 'confirmed' | 'failed';
  metadata: Record<string, any>;
  created_at: string;
}

export interface ProfileMetadata {
  id: string;
  user_id: string;
  metadata_type: 'medical' | 'verification' | 'preferences';
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DocumentStorage {
  id: string;
  user_id: string;
  document_type: 'medical_report' | 'id_verification' | 'blood_test';
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  verified: boolean;
  created_at: string;
}
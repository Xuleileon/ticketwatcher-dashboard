import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = 'https://ysaygdcpwfqkwysprwxz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzYXlnZGNwd2Zxa3d5c3Byd3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQzMjEyMzQsImV4cCI6MjAxOTg5NzIzNH0.qDj5YKxvqRxq5yDMQfGzuVl_cQGB0-t8wc-sH7iBKl0';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
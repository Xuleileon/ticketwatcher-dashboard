import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ovhgjefrdtqkszubpxnd.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92aGdqZWZyZHRxa3N6dWJweG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NDE4NDIsImV4cCI6MjA1MDUxNzg0Mn0.qAGJ_hICxVes7ujBcFX3NrhFjuO1rFp2KEt3YaYO1fE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
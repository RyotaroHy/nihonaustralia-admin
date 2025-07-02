import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export const createSupabaseServerClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Server-side admin client with service role for elevated permissions
export const createSupabaseServerAdminClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
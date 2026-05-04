import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export const connectSupabase = (): SupabaseClient => {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables');
    }

    supabase = createClient(url, key);
    console.log('Supabase client initialized');
  }
  
  return supabase;
};

export const getSupabaseClient = (): SupabaseClient => {
  return supabase || connectSupabase();
};

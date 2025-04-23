
import { createClient } from '@supabase/supabase-js';

// Get environment variables or use fallbacks for local development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Utility function to check if Supabase connection is valid
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Attempt to query a simple value to check connection
    const { data, error } = await supabase.from('pacts').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

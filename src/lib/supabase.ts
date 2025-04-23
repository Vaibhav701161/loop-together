
import { createClient } from '@supabase/supabase-js';

// Define default values for development and safety
const DEFAULT_SUPABASE_URL = 'https://your-project-id.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'your-anon-key';

// Get environment variables or use fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Create the Supabase client with fallbacks to prevent blank screens
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

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

// Helper to determine if we have valid credentials
export function hasValidSupabaseCredentials(): boolean {
  return (
    supabaseUrl !== DEFAULT_SUPABASE_URL && 
    supabaseUrl !== '' && 
    supabaseAnonKey !== DEFAULT_SUPABASE_ANON_KEY && 
    supabaseAnonKey !== ''
  );
}

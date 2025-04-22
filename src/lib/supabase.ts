import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Get Supabase URL and key from environment variables
// Fallback to empty strings if not available, but show a warning
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are available and warn if not
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase credentials missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.'
  );
}

// Create the Supabase client only if credentials are available
// Otherwise return a mock client that will throw errors when used
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : createClient<Database>(
      'https://placeholder-url.supabase.co',  // This is just a placeholder
      'placeholder-key'                       // This is just a placeholder
    );

// Helper function to get user data
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Helper function to get profile data
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  return data
}

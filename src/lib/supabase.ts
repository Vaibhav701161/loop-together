
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

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

// Initialize database schema if needed
export async function initSupabaseSchema() {
  try {
    // Create users table if it doesn't exist
    const { error: usersError } = await supabase.rpc('create_users_table');
    if (usersError && !usersError.message.includes('already exists')) {
      console.error("Error creating users table:", usersError);
    }
    
    // Create pacts table if it doesn't exist
    const { error: pactsError } = await supabase.rpc('create_pacts_table');
    if (pactsError && !pactsError.message.includes('already exists')) {
      console.error("Error creating pacts table:", pactsError);
    }
    
    // Create pact_logs table if it doesn't exist
    const { error: logsError } = await supabase.rpc('create_pact_logs_table');
    if (logsError && !logsError.message.includes('already exists')) {
      console.error("Error creating pact_logs table:", logsError);
    }

    // Create couple_codes table if it doesn't exist
    const { error: codesError } = await supabase.rpc('create_couple_codes_table');
    if (codesError && !codesError.message.includes('already exists')) {
      console.error("Error creating couple_codes table:", codesError);
    }
    
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}

// Helper function to save data to Supabase or localStorage as fallback
export async function saveData<T extends { id: string }>(
  tableName: string, 
  data: T, 
  localStorageKey: string
): Promise<T> {
  // Always save to localStorage as a fallback
  const localData = localStorage.getItem(localStorageKey);
  const items = localData ? JSON.parse(localData) as T[] : [];
  const updatedItems = [...items.filter(item => item.id !== data.id), data];
  localStorage.setItem(localStorageKey, JSON.stringify(updatedItems));
  
  // Try to save to Supabase if credentials are valid
  if (hasValidSupabaseCredentials()) {
    try {
      const { error } = await supabase.from(tableName).upsert(data);
      if (error) throw error;
    } catch (error) {
      console.error(`Error saving to ${tableName}:`, error);
      toast({
        title: 'Sync Error',
        description: `Data saved locally but failed to sync online`,
        variant: 'destructive',
      });
    }
  }
  
  return data;
}

// Helper to fetch data from Supabase or localStorage
export async function fetchData<T>(
  tableName: string,
  localStorageKey: string
): Promise<T[]> {
  // Try fetching from Supabase
  if (hasValidSupabaseCredentials()) {
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;
      
      // Save the data to localStorage as a backup
      localStorage.setItem(localStorageKey, JSON.stringify(data));
      return data as T[];
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      // Fall back to localStorage
    }
  }
  
  // Use localStorage data
  const localData = localStorage.getItem(localStorageKey);
  return localData ? JSON.parse(localData) as T[] : [];
}

// Helper to delete data from Supabase and localStorage
export async function deleteData(
  tableName: string,
  id: string,
  localStorageKey: string
): Promise<boolean> {
  // Remove from localStorage
  const localData = localStorage.getItem(localStorageKey);
  if (localData) {
    const items = JSON.parse(localData);
    const filteredItems = items.filter((item: any) => item.id !== id);
    localStorage.setItem(localStorageKey, JSON.stringify(filteredItems));
  }
  
  // Delete from Supabase if credentials are valid
  if (hasValidSupabaseCredentials()) {
    try {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      return false;
    }
  }
  
  return true;
}

// Generate a unique code for couple pairing
export function generateCoupleCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Create a couple pairing in Supabase
export async function createCouplePairing(code: string, userId: string): Promise<boolean> {
  // Save to localStorage first
  const storedCodes = localStorage.getItem("2getherLoop_couple_codes");
  const codes = storedCodes ? JSON.parse(storedCodes) : [];
  codes.push({ code, userId, createdAt: new Date().toISOString() });
  localStorage.setItem("2getherLoop_couple_codes", JSON.stringify(codes));
  
  // Save to Supabase if available
  if (hasValidSupabaseCredentials()) {
    try {
      const { error } = await supabase.from('couple_codes').insert({
        code,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error creating couple pairing:", error);
      return false;
    }
  }
  
  return true;
}

// Validate and use a couple code
export async function validateCoupleCode(code: string): Promise<string | null> {
  // Check localStorage first
  const storedCodes = localStorage.getItem("2getherLoop_couple_codes");
  if (storedCodes) {
    const codes = JSON.parse(storedCodes);
    const match = codes.find((c: any) => c.code === code);
    if (match) return match.userId;
  }
  
  // Check Supabase if available
  if (hasValidSupabaseCredentials()) {
    try {
      const { data, error } = await supabase
        .from('couple_codes')
        .select('user_id')
        .eq('code', code)
        .limit(1);
      
      if (error) throw error;
      if (data && data.length > 0) return data[0].user_id;
    } catch (error) {
      console.error("Error validating couple code:", error);
    }
  }
  
  return null;
}

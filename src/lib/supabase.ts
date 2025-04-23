import { createClient } from '@supabase/supabase-js';
import { setupDatabaseSchema } from './supabase/schema';

// Define default values for development and safety
const DEFAULT_SUPABASE_URL = 'https://example.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'example-key';

// Get cached client instance
let supabaseInstance: any = null;

/**
 * Creates and returns a Supabase client with the latest credentials
 */
export function getSupabaseClient() {
  // Get the latest credentials from localStorage
  const supabaseUrl = localStorage.getItem("VITE_SUPABASE_URL") || 
                      import.meta.env.VITE_SUPABASE_URL || 
                      DEFAULT_SUPABASE_URL;
  
  const supabaseAnonKey = localStorage.getItem("VITE_SUPABASE_ANON_KEY") || 
                          import.meta.env.VITE_SUPABASE_ANON_KEY || 
                          DEFAULT_SUPABASE_ANON_KEY;
  
  // Create a new client if credentials changed or client doesn't exist
  if (!supabaseInstance || 
      supabaseInstance.supabaseUrl !== supabaseUrl || 
      supabaseInstance.supabaseKey !== supabaseAnonKey) {
    
    console.log("Creating new Supabase client with URL:", supabaseUrl);
    
    // Create Supabase client
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    
    // Cache instance and credentials
    supabaseInstance = {
      client,
      supabaseUrl,
      supabaseKey: supabaseAnonKey
    };
  }
  
  return supabaseInstance.client;
}

// Export supabase client for backward compatibility
export const supabase = getSupabaseClient();

/**
 * Checks if Supabase connection is valid
 */
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Get a fresh client with latest credentials
    const client = getSupabaseClient();
    
    // Attempt to query a simple value to check connection
    const { data, error } = await client.from('pacts').select('id').limit(1);
    
    console.log("Supabase connection test result:", { data, error });
    
    return !error;
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
}

/**
 * Helper to determine if we have valid credentials
 */
export function hasValidSupabaseCredentials(): boolean {
  const url = localStorage.getItem("VITE_SUPABASE_URL") || import.meta.env.VITE_SUPABASE_URL;
  const key = localStorage.getItem("VITE_SUPABASE_ANON_KEY") || import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const isValid = (
    url !== DEFAULT_SUPABASE_URL && 
    url !== '' && 
    key !== DEFAULT_SUPABASE_ANON_KEY && 
    key !== ''
  );
  
  console.log("Checking Supabase credentials validity:", { url, isValid });
  
  return isValid;
}

/**
 * Initialize database schema if needed
 */
export async function initSupabaseSchema() {
  // Only try to initialize if we have valid credentials
  if (!hasValidSupabaseCredentials()) {
    console.warn("Cannot initialize Supabase schema: Invalid credentials");
    return false;
  }
  
  try {
    // Get a fresh client with latest credentials
    const client = getSupabaseClient();
    
    const result = await setupDatabaseSchema(client);
    
    if (!result.success) {
      console.error("Database initialization had errors:", result.errors);
    }
    
    return result.success;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}

/**
 * Helper function to save data to Supabase or localStorage as fallback
 */
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
      const client = getSupabaseClient();
      const { error } = await client.from(tableName).upsert(data);
      if (error) throw error;
    } catch (error) {
      console.error(`Error saving to ${tableName}:`, error);
      console.warn(`Data saved locally but failed to sync online`);
    }
  }
  
  return data;
}

/**
 * Helper to fetch data from Supabase or localStorage
 */
export async function fetchData<T>(
  tableName: string,
  localStorageKey: string
): Promise<T[]> {
  // Try fetching from Supabase
  if (hasValidSupabaseCredentials()) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client.from(tableName).select('*');
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

/**
 * Helper to delete data from Supabase and localStorage
 */
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
      const client = getSupabaseClient();
      const { error } = await client.from(tableName).delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      return false;
    }
  }
  
  return true;
}

/**
 * Generate a unique code for couple pairing
 */
export function generateCoupleCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/**
 * Create a couple pairing in Supabase
 */
export async function createCouplePairing(code: string, userId: string): Promise<boolean> {
  // Save to localStorage first
  const storedCodes = localStorage.getItem("2getherLoop_couple_codes");
  const codes = storedCodes ? JSON.parse(storedCodes) : [];
  codes.push({ code, userId, createdAt: new Date().toISOString() });
  localStorage.setItem("2getherLoop_couple_codes", JSON.stringify(codes));
  
  // Save to Supabase if available
  if (hasValidSupabaseCredentials()) {
    try {
      const client = getSupabaseClient();
      const { error } = await client.from('couple_codes').insert({
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

/**
 * Validate and use a couple code
 */
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
      const client = getSupabaseClient();
      const { data, error } = await client
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

/**
 * Upload proof image to Supabase storage or convert to data URL for local storage
 */
export async function uploadProofImage(file: File): Promise<string> {
  // Return data URL for local storage mode
  if (!hasValidSupabaseCredentials()) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
  
  // Upload to Supabase Storage
  try {
    const client = getSupabaseClient();
    
    // Create a unique filename
    const extension = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${extension}`;
    
    // Upload the file to the 'proofs' bucket
    const { data, error } = await client.storage
      .from('proofs')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // Get public URL for the uploaded file
    const { data: urlData } = client.storage
      .from('proofs')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image to Supabase:", error);
    
    // Fallback to data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
}

/**
 * Setup real-time subscription for data changes
 */
export function subscribeToChanges(
  tableName: string, 
  onInsert?: (payload: any) => void, 
  onUpdate?: (payload: any) => void, 
  onDelete?: (payload: any) => void
) {
  if (!hasValidSupabaseCredentials()) return () => {}; // Return no-op if not configured
  
  const client = getSupabaseClient();
  const channel = client
    .channel(`public:${tableName}`)
    .on('postgres_changes', {
      event: 'INSERT', 
      schema: 'public', 
      table: tableName
    }, (payload) => {
      if (onInsert) onInsert(payload);
    })
    .on('postgres_changes', {
      event: 'UPDATE', 
      schema: 'public', 
      table: tableName
    }, (payload) => {
      if (onUpdate) onUpdate(payload);
    })
    .on('postgres_changes', {
      event: 'DELETE', 
      schema: 'public', 
      table: tableName
    }, (payload) => {
      if (onDelete) onDelete(payload);
    })
    .subscribe();
  
  // Return unsubscribe function
  return () => {
    client.removeChannel(channel);
  };
}

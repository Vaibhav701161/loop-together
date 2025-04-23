
import { supabase } from '../supabase';

export interface SchemaSetupResult {
  success: boolean;
  errors: string[];
}

/**
 * Sets up the complete database schema for the application
 */
export async function setupDatabaseSchema(): Promise<SchemaSetupResult> {
  const errors: string[] = [];
  
  try {
    // Create users table
    const { error: usersError } = await supabase.rpc('create_users_table_if_not_exists');
    if (usersError) errors.push(`Users table: ${usersError.message}`);
    
    // Create pacts table
    const { error: pactsError } = await supabase.rpc('create_pacts_table_if_not_exists');
    if (pactsError) errors.push(`Pacts table: ${pactsError.message}`);
    
    // Create pact_logs table
    const { error: logsError } = await supabase.rpc('create_pact_logs_table_if_not_exists');
    if (logsError) errors.push(`Pact logs table: ${logsError.message}`);
    
    // Create couple_codes table
    const { error: codesError } = await supabase.rpc('create_couple_codes_table_if_not_exists');
    if (codesError) errors.push(`Couple codes table: ${codesError.message}`);
    
    // Create storage bucket for proof uploads if it doesn't exist
    const { error: storageError } = await supabase.storage.createBucket('proofs', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif']
    });
    
    // Ignore "already exists" errors
    if (storageError && !storageError.message.includes('already exists')) {
      errors.push(`Storage bucket: ${storageError.message}`);
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  } catch (error: any) {
    return {
      success: false,
      errors: [`Schema setup failed: ${error.message || 'Unknown error'}`]
    };
  }
}

/**
 * Creates SQL functions in Supabase to manage database tables
 * To be run in Supabase SQL editor
 */
export const getTableCreationSQL = (): string => `
-- Create function to create users table if it doesn't exist
CREATE OR REPLACE FUNCTION create_users_table_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to create pacts table if it doesn't exist
CREATE OR REPLACE FUNCTION create_pacts_table_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.pacts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    assignedTo TEXT NOT NULL,
    deadline TEXT NOT NULL,
    frequency TEXT NOT NULL,
    proofType TEXT NOT NULL,
    startDate TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    maxFailCount INTEGER DEFAULT 3,
    punishment TEXT,
    reward TEXT,
    color TEXT
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to create pact_logs table if it doesn't exist
CREATE OR REPLACE FUNCTION create_pact_logs_table_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.pact_logs (
    id TEXT PRIMARY KEY,
    pactId TEXT NOT NULL REFERENCES public.pacts(id) ON DELETE CASCADE,
    userId TEXT NOT NULL,
    date TEXT NOT NULL,
    completedAt TEXT NOT NULL,
    status TEXT NOT NULL,
    note TEXT,
    proofType TEXT,
    proofUrl TEXT
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to create couple_codes table if it doesn't exist
CREATE OR REPLACE FUNCTION create_couple_codes_table_if_not_exists()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.couple_codes (
    code TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    partner_user_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    claimed_at TIMESTAMP WITH TIME ZONE
  );
END;
$$ LANGUAGE plpgsql;

-- Enable row-level security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pact_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_codes ENABLE ROW LEVEL SECURITY;

-- Create policies allowing anonymous access (for this app's use case)
CREATE POLICY "Allow anonymous select" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON public.users FOR DELETE USING (true);

CREATE POLICY "Allow anonymous select" ON public.pacts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON public.pacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON public.pacts FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON public.pacts FOR DELETE USING (true);

CREATE POLICY "Allow anonymous select" ON public.pact_logs FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON public.pact_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON public.pact_logs FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON public.pact_logs FOR DELETE USING (true);

CREATE POLICY "Allow anonymous select" ON public.couple_codes FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert" ON public.couple_codes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update" ON public.couple_codes FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete" ON public.couple_codes FOR DELETE USING (true);
`;

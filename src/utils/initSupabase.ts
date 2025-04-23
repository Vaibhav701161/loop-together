
import { supabase } from "@/lib/supabase";

/**
 * Initializes Supabase with the required tables for the application
 * This should be run once when setting up a new Supabase project
 */
export async function initializeSupabaseDatabase() {
  try {
    // Create users table
    const { error: usersError } = await supabase.rpc('create_users_table');
    if (usersError && !usersError.message.includes('already exists')) {
      console.error("Error creating users table:", usersError);
    }
    
    // Create pacts table
    const { error: pactsError } = await supabase.rpc('create_pacts_table');
    if (pactsError && !pactsError.message.includes('already exists')) {
      console.error("Error creating pacts table:", pactsError);
    }
    
    // Create pact_logs table
    const { error: logsError } = await supabase.rpc('create_pact_logs_table');
    if (logsError && !logsError.message.includes('already exists')) {
      console.error("Error creating pact_logs table:", logsError);
    }
    
    // Create couple_codes table
    const { error: codesError } = await supabase.rpc('create_couple_codes_table');
    if (codesError && !codesError.message.includes('already exists')) {
      console.error("Error creating couple_codes table:", codesError);
    }
    
    console.log("Database initialization complete");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}

// Example function for creating stored procedures in Supabase
export async function createDatabaseProcedures() {
  // These would normally be created in the Supabase SQL editor or dashboard
  // For simplicity, we're documenting what these procedures should do
  
  /*
  SQL for creating tables (to be run in Supabase SQL editor):
  
  -- Users table
  CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  
  -- Pacts table
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
  
  -- Pact logs table
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
  
  -- Couple codes table
  CREATE TABLE IF NOT EXISTS public.couple_codes (
    code TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    partner_user_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    claimed_at TIMESTAMP WITH TIME ZONE
  );
  
  -- Create stored procedures
  CREATE OR REPLACE FUNCTION public.create_users_table()
  RETURNS void AS $$
  BEGIN
    CREATE TABLE IF NOT EXISTS public.users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  END;
  $$ LANGUAGE plpgsql;
  
  CREATE OR REPLACE FUNCTION public.create_pacts_table()
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
  
  CREATE OR REPLACE FUNCTION public.create_pact_logs_table()
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
  
  CREATE OR REPLACE FUNCTION public.create_couple_codes_table()
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
  */
  
  return true;
}

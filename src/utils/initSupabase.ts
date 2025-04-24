
import { getSupabaseClient } from "@/lib/supabase";

export async function initializeSupabaseDatabase() {
  try {
    const client = getSupabaseClient();
    
    // Create users table
    await client.rpc('create_table_if_not_exists', {
      table_name: 'users',
      table_sql: `
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    // Create pacts table
    await client.rpc('create_table_if_not_exists', {
      table_name: 'pacts',
      table_sql: `
        CREATE TABLE pacts (
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
      `
    });
    
    // Create pact_logs table
    await client.rpc('create_table_if_not_exists', {
      table_name: 'pact_logs',
      table_sql: `
        CREATE TABLE pact_logs (
          id TEXT PRIMARY KEY,
          pactId TEXT NOT NULL REFERENCES pacts(id) ON DELETE CASCADE,
          userId TEXT NOT NULL,
          date TEXT NOT NULL,
          completedAt TEXT NOT NULL,
          status TEXT NOT NULL,
          note TEXT,
          proofType TEXT,
          proofUrl TEXT
        );
      `
    });
    
    // Create couple_codes table
    await client.rpc('create_table_if_not_exists', {
      table_name: 'couple_codes',
      table_sql: `
        CREATE TABLE couple_codes (
          code TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          partner_user_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          claimed_at TIMESTAMP WITH TIME ZONE
        );
      `
    });
    
    // Create storage bucket for proofs if it doesn't exist
    const { data: bucket } = await client.storage.getBucket('proofs');
    if (!bucket) {
      await client.storage.createBucket('proofs', { public: true });
    }
    
    return { success: true, errors: [] };
  } catch (error) {
    console.error("Database initialization failed:", error);
    return { 
      success: false, 
      errors: [(error as Error).message]
    };
  }
}

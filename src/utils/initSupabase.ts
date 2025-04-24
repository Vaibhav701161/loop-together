
import { getSupabaseClient } from "@/lib/supabase";

export async function initializeSupabaseDatabase() {
  try {
    const client = getSupabaseClient();
    
    // Create tables without using RPC functions
    // Create users table
    await client.from('users').insert(null).select().limit(0).catch(() => {
      console.log("Creating users table");
      return client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
    });
    
    // Create pacts table
    await client.from('pacts').insert(null).select().limit(0).catch(() => {
      console.log("Creating pacts table");
      return client.query(`
        CREATE TABLE IF NOT EXISTS pacts (
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
      `);
    });
    
    // Create pact_logs table
    await client.from('pact_logs').insert(null).select().limit(0).catch(() => {
      console.log("Creating pact_logs table");
      return client.query(`
        CREATE TABLE IF NOT EXISTS pact_logs (
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
      `);
    });
    
    // Create couple_codes table
    await client.from('couple_codes').insert(null).select().limit(0).catch(() => {
      console.log("Creating couple_codes table");
      return client.query(`
        CREATE TABLE IF NOT EXISTS couple_codes (
          code TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          partner_user_id TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          claimed_at TIMESTAMP WITH TIME ZONE
        );
      `);
    });
    
    // Create storage bucket for proofs if it doesn't exist
    try {
      const { data: bucket } = await client.storage.getBucket('proofs');
      if (!bucket) {
        await client.storage.createBucket('proofs', { 
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif'],
          fileSizeLimit: 10 * 1024 * 1024 // 10MB
        });
        console.log("Created proofs bucket");
      }
    } catch (error) {
      console.log("Storage bucket creation error:", error);
      // Continue even if bucket creation fails - local storage will be used as fallback
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

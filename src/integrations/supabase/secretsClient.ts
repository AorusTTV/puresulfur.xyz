
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { secretsManager } from '@/utils/secretsManager';

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export const getSupabaseClient = async () => {
  if (supabaseClient) {
    return supabaseClient;
  }

  try {
    // Load secrets from AWS Parameter Store
    const supabaseUrl = "https://sckkxdmwzxayefwvcgic.supabase.co";
    const supabaseAnonKey = await secretsManager.getSupabaseAnonKey();

    if (!supabaseAnonKey) {
      throw new Error('Supabase anonymous key not found in secrets');
    }

    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
    
    console.log('[SUPABASE] Client initialized with secrets from Parameter Store');
    return supabaseClient;
  } catch (error) {
    console.error('[SUPABASE] Failed to initialize client with secrets:', error);
    throw error;
  }
};

// Backward compatibility - export the client for immediate use in dev
export const supabase = createClient<Database>(
  "https://sckkxdmwzxayefwvcgic.supabase.co",
  process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNja2t4ZG13enhheWVmd3ZjZ2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2OTI2MDgsImV4cCI6MjA2ODI2ODYwOH0.bu0p6fXSnlw02qRDkKUCo1IBTwMherhRmJT54NTQd-w"
);

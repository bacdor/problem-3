/**
 * Supabase client initialization
 */

import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Create a single supabase client for interacting with your database
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


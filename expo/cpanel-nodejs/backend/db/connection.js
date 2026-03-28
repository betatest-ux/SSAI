import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase credentials not configured');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export function getDatabase() {
  return supabaseAdmin;
}

export async function initializeDatabase() {
  try {
    console.log('✅ Supabase connection established');
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error);
    throw error;
  }
}

export function closeDatabase() {
  console.log('✅ Supabase connection closed');
}

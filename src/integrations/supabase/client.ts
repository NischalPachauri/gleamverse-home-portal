import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigured) {
  console.error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Features depending on Supabase will be disabled.');
}

const urlRegex = /^https?:\/\//;
if (supabaseUrl && !urlRegex.test(supabaseUrl)) {
  console.error(`Invalid supabaseUrl: "${supabaseUrl}" must start with http:// or https://`);
}

const supabase = (isSupabaseConfigured && urlRegex.test(supabaseUrl))
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : ({} as unknown as ReturnType<typeof createClient>);

console.log('Supabase client initialized with URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'not set');

export default supabase;
export { supabase };

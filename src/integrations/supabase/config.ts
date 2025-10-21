// Supabase configuration with fallback values
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://kczjmswsvqybjtgxbjnn.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjemptc3N2cXlieWp0Z3hia25uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzIwNzQ0MDAsImV4cCI6MjA0NzY1MDQwMH0.placeholder_key'
};


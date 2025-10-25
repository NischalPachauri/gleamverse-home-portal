// Supabase configuration
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://kczjmswsvqybjtgxbjnn.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjemptc3dzdnF5Ymp0Z3hiam5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMDU0NDAsImV4cCI6MjA3NTU4MTQ0MH0.BEW1jaeNydXkRZ1W11-Kbq9kOBSIeYhI6CqcR5GNuWM'
};

// Check if configuration is properly set
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey) {
  console.warn('Supabase configuration is missing. Please check your environment variables.');
}


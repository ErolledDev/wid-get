import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  'https://hfyuthryxzrsvkbfagbd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmeXV0aHJ5eHpyc3ZrYmZhZ2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMTM5NzcsImV4cCI6MjA1NTg4OTk3N30.CcQpt9bTpRc3QpSslDhKMHOEPuMloxchmW9jK71MmCE',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: 'pkce'
    }
  }
);
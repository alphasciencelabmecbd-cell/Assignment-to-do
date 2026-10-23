import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://epqwjnsauwrjlvplkjoa.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXdqbnNhdXdyamx2cGxram9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMzg1NjAsImV4cCI6MjEwMDgxNDU2MH0._yzwjCUHhMCwYbrULwgwRc4xDIFJl-qM2LVH7FRtobU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

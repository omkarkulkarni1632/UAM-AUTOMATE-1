import { createClient } from '@supabase/supabase-js';

// Admin client initialization
const adminSupabaseUrl = 'YOUR_ADMIN_SUPABASE_URL';
const adminSupabaseKey = 'YOUR_ADMIN_SUPABASE_KEY';
export const adminSupabase = createClient(adminSupabaseUrl, adminSupabaseKey);

// Client-side client initialization
const clientSupabaseUrl = 'YOUR_CLIENT_SUPABASE_URL';
const clientSupabaseKey = 'YOUR_CLIENT_SUPABASE_KEY';
export const clientSupabase = createClient(clientSupabaseUrl, clientSupabaseKey);

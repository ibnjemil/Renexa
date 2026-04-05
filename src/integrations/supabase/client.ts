import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ymwhedotzhgrgpybfjmt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltd2hlZG90emhncmdweWJmam10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MTE2NjUsImV4cCI6MjA5MDE4NzY2NX0.n16nbLIvVyYYOfxVODN49YV4VF3aaz5ngMvbO3n4oIA";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: window.localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

import { createClient } from '@supabase/supabase-js';

// Hardcoded for a guaranteed fix
const supabaseUrl = "https://usrrxhexgdfxbvsubknz.supabase.co";
const supabaseAnonKey = "sb_publishable_GTWWxVBC4r8vVlhOSR8_7w_5D5ZlwEu";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

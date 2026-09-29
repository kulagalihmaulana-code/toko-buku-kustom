import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://avpxxsagiltfhvyoyzac.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_njr1V8KjlqT6Pq1hKO7esQ_2QGSpCHo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
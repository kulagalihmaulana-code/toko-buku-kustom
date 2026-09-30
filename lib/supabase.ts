import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL atau ANON KEY belum di-set di .env.local');
}

// Client untuk BROWSER (aman dipakai di client component)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
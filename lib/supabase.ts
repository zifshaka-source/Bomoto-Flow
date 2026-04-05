import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Restaurant {
  id: string;
  name: string;
  image_url: string;
  rating: number;
  price_level: number;
  cuisine_tags: string[];
  description: string;
  delivery_time: string;
  created_at: string;
}

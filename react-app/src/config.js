import { createClient } from '@supabase/supabase-js';

// Lấy config từ env variables
// Vite sử dụng import.meta.env thay vì process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trong .env');
}

// Tạo Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);















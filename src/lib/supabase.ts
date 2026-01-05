import { createClient } from '@supabase/supabase-js';
import type {
  Course,
  Teacher,
  Application,
  Event,
  Achievement,
  Admin,
  Category,
  ContentBlock,
  SiteStat,
  Testimonial,
  GalleryItem,
  ScheduleEntry,
} from '@shared/schema';

// Supabase konfiguratsiyasi
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';


if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = '❌ XATO: Supabase URL va Anon Key topilmadi!\n' +
    '📁 Environment variables\'ni tekshiring:\n' +
    '   VITE_SUPABASE_URL=https://xxxxx.supabase.co\n' +
    '   VITE_SUPABASE_ANON_KEY=eyJhbGci...';
  
  if (import.meta.env.DEV) {
    console.error(errorMsg);
  } else {
    // Production'da faqat critical error'ni ko'rsatish
    console.error('Supabase configuration missing');
  }
}

// Supabase client yaratish
// Agar environment variables bo'lmasa, empty string bilan yaratamiz
// (bu production'da environment variables sozlashni majburiy qiladi)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);


// Re-export types from shared schema for convenience
export type {
  Course,
  Teacher,
  Application,
  Event,
  Achievement,
  Admin,
  Category,
  ContentBlock,
  SiteStat,
  Testimonial,
  GalleryItem,
  ScheduleEntry,
};


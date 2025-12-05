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

// Debug: Environment variables tekshirish
console.log('🔌 Supabase ulanish:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : '❌ TOPILMADI',
  key: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : '❌ TOPILMADI',
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ XATO: Supabase URL va Anon Key topilmadi!\n' +
    '📁 client/.env faylida quyidagilarni tekshiring:\n' +
    '   VITE_SUPABASE_URL=https://xxxxx.supabase.co\n' +
    '   VITE_SUPABASE_ANON_KEY=eyJhbGci...'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

// Ulanishni tekshirish
(async () => {
  try {
    const { count, error } = await supabase.from('courses').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('❌ Supabase ulanish xatosi:', error.message);
      console.error('💡 FIX_DATABASE.sql faylini Supabase SQL Editor\'da ishga tushiring');
    } else {
      console.log('✅ Supabase ulandi! Kurslar soni:', count);
    }
  } catch (err) {
    console.error('❌ Supabase ulanib bo\'lmadi:', err);
  }
})();

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


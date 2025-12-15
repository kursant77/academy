-- ============================================
-- TO'LIQ DATABASE SETUP - BARCHA JADVALLAR, FUNCTIONLAR, TRIGGERLAR VA SOZLAMALAR
-- ============================================
-- Bu fayl barcha SQL fayllarni birlashtirgan to'liq setup faylidir
-- Supabase SQL Editor'da ishga tushiring
-- ============================================

-- ============================================
-- 1. JADVALLAR YARATISH
-- ============================================

-- TEACHERS (O'qituvchilar)
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  specialty_uz TEXT NOT NULL,
  specialty_ru TEXT NOT NULL,
  specialty_en TEXT NOT NULL,
  experience INTEGER NOT NULL,
  bio TEXT NOT NULL,
  bio_uz TEXT NOT NULL,
  bio_ru TEXT NOT NULL,
  bio_en TEXT NOT NULL,
  image_url TEXT,
  linked_in TEXT,
  telegram TEXT,
  instagram TEXT,
  phone TEXT,
  monthly_salary NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CATEGORIES (Kategoriyalar) - Avval yaratish kerak, chunki courses va events buni reference qiladi
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('course', 'event')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COURSES (Kurslar)
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT NOT NULL,
  description_uz TEXT NOT NULL,
  description_ru TEXT NOT NULL,
  description_en TEXT NOT NULL,
  category TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  duration TEXT NOT NULL,
  price TEXT NOT NULL,
  level TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  schedule TEXT NOT NULL,
  image_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EVENTS (Tadbirlar)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_uz TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description TEXT NOT NULL,
  description_uz TEXT NOT NULL,
  description_ru TEXT NOT NULL,
  description_en TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PROFILES (Foydalanuvchi profillari)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'student',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- APPLICATIONS (Ro'yxatdan o'tganlar)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  phone TEXT NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  interests TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((course_id IS NOT NULL) OR (category_id IS NOT NULL))
);

-- ACHIEVEMENTS (Yutuqlar)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_uz TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description TEXT NOT NULL,
  description_uz TEXT NOT NULL,
  description_ru TEXT NOT NULL,
  description_en TEXT NOT NULL,
  image_url TEXT,
  student_name TEXT NOT NULL,
  student_name_uz TEXT NOT NULL,
  student_name_ru TEXT NOT NULL,
  student_name_en TEXT NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONTENT BLOCKS (Umumiy matnlar)
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  content_key TEXT NOT NULL,
  locale TEXT NOT NULL,
  value TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT content_blocks_unique_key UNIQUE(section, content_key, locale)
);

-- SITE STATS (Statistikalar)
CREATE TABLE IF NOT EXISTS site_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  value TEXT NOT NULL,
  label_uz TEXT NOT NULL,
  label_ru TEXT NOT NULL,
  label_en TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TESTIMONIALS (Fikrlar)
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  course TEXT NOT NULL,
  text_uz TEXT NOT NULL,
  text_ru TEXT NOT NULL,
  text_en TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GALLERY ITEMS (Galereya)
CREATE TABLE IF NOT EXISTS gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_uz TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SCHEDULE ENTRIES (Dars jadvali)
CREATE TABLE IF NOT EXISTS schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  title_uz TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  title_en TEXT NOT NULL,
  room TEXT,
  format TEXT,
  teacher_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GROUPS (Guruhlar)
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  schedule TEXT NOT NULL,
  room TEXT NOT NULL,
  max_students INTEGER NOT NULL DEFAULT 12,
  current_students INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  attendance_rate INTEGER NOT NULL DEFAULT 85,
  monthly_revenue NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STUDENTS (O'quvchilar)
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  parent_name TEXT NOT NULL,
  parent_contact TEXT NOT NULL,
  monthly_payment NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
  payment_valid_until DATE,
  last_paid_month TEXT,
  course_name TEXT,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAYMENT HISTORY (To'lov tarixi)
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid')),
  method TEXT NOT NULL CHECK (method IN ('cash', 'card', 'transfer')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MONTHLY PAYMENTS (Oylik to'lovlar)
CREATE TABLE IF NOT EXISTS monthly_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM (masalan: 2025-01)
  year INTEGER NOT NULL,
  month_number INTEGER NOT NULL, -- 1-12
  amount NUMERIC(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  method TEXT NOT NULL CHECK (method IN ('cash', 'card', 'transfer')),
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'overdue')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_student_month UNIQUE(student_id, month)
);

-- REVENUE (Daromad)
CREATE TABLE IF NOT EXISTS revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  month TEXT NOT NULL, -- Format: YYYY-MM
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXPENSES (Xarajatlar)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  month TEXT NOT NULL, -- Format: YYYY-MM
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('fixed', 'variable')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ADMINS (Adminlar)
DROP TABLE IF EXISTS admins CASCADE;
CREATE TABLE admins (
  login TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SYSTEM OPTIONS (Tizim sozlamalari)
CREATE TABLE IF NOT EXISTS system_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_type TEXT NOT NULL,
  option_key TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_en TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_option_type_key UNIQUE(option_type, option_key)
);

-- CONTACT MESSAGES (Aloqa xabarlari)
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. FUNCTIONLAR
-- ============================================

-- update_updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Admin login verification function
DROP FUNCTION IF EXISTS verify_admin_login(text, text);
CREATE OR REPLACE FUNCTION verify_admin_login(
  p_login TEXT,
  p_password TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin admins%ROWTYPE;
BEGIN
  SELECT * INTO v_admin
  FROM admins
  WHERE admins.login = p_login;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'login', NULL, 'name', NULL);
  END IF;

  IF v_admin.password = p_password THEN
    RETURN json_build_object(
      'success', true,
      'login', v_admin.login,
      'name', v_admin.name
    );
  ELSE
    RETURN json_build_object('success', false, 'login', NULL, 'name', NULL);
  END IF;
END;
$$;

-- Telegram xabar yuborish funksiyasi
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION send_telegram_message(
  chat_id TEXT,
  message_text TEXT,
  bot_token TEXT DEFAULT '8578440348:AAHM-FGbW6al3w8wyqSNTWTsCpolhxoJ1ls'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response_status INTEGER;
  response_body TEXT;
BEGIN
  -- Telegram Bot API ga HTTP POST so'rov yuborish
  SELECT status, content INTO response_status, response_body
  FROM net.http_post(
    url := format('https://api.telegram.org/bot%s/sendMessage', bot_token),
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    )::jsonb,
    body := jsonb_build_object(
      'chat_id', chat_id,
      'text', message_text,
      'parse_mode', 'HTML'
    )::jsonb
  );

  -- Agar muvaffaqiyatli bo'lsa (status 200), TRUE qaytaradi
  RETURN response_status = 200;
EXCEPTION
  WHEN OTHERS THEN
    -- Xatolik bo'lsa, log'ga yozadi va FALSE qaytaradi
    RAISE WARNING 'Telegram xabar yuborishda xatolik: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- Applications jadvali uchun trigger function
CREATE OR REPLACE FUNCTION notify_new_application()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  telegram_message TEXT;
  course_name TEXT;
BEGIN
  -- Kurs nomini olish
  SELECT COALESCE(name_uz, name_ru, name_en, 'Noma''lum kurs')
  INTO course_name
  FROM courses
  WHERE id = NEW.course_id;

  -- Telegram xabarini formatlash
  telegram_message := format(
    E'🆕 <b>Yangi ro''yxatdan o''tish</b>\n\n' ||
    E'👤 <b>Ism:</b> %s\n' ||
    E'📅 <b>Yosh:</b> %s\n' ||
    E'📱 <b>Telefon:</b> %s\n' ||
    E'📚 <b>Kurs:</b> %s\n\n' ||
    E'⏰ <i>Vaqt: %s</i>',
    NEW.full_name,
    NEW.age::TEXT,
    NEW.phone,
    course_name,
    TO_CHAR(NOW(), 'DD.MM.YYYY, HH24:MI:SS')
  );

  -- Telegram'ga xabar yuborish
  PERFORM send_telegram_message(
    chat_id := '5865994146',
    message_text := telegram_message,
    bot_token := '8578440348:AAHM-FGbW6al3w8wyqSNTWTsCpolhxoJ1ls'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Telegram xabar yuborishda xatolik: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Contact messages uchun trigger function
CREATE OR REPLACE FUNCTION notify_new_contact_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  telegram_message TEXT;
BEGIN
  -- Telegram xabarini formatlash
  telegram_message := format(
    E'📧 <b>Yangi xabar (Aloqa)</b>\n\n' ||
    E'👤 <b>Ism:</b> %s\n' ||
    E'📮 <b>Email:</b> %s\n' ||
    E'💬 <b>Xabar:</b>\n\n%s\n\n' ||
    E'⏰ <i>Vaqt: %s</i>',
    NEW.name,
    NEW.email,
    NEW.message,
    TO_CHAR(NOW(), 'DD.MM.YYYY, HH24:MI:SS')
  );

  -- Telegram'ga xabar yuborish
  PERFORM send_telegram_message(
    chat_id := '5865994146',
    message_text := telegram_message,
    bot_token := '8578440348:AAHM-FGbW6al3w8wyqSNTWTsCpolhxoJ1ls'
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Telegram xabar yuborishda xatolik: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- To'lov muddatini tekshirish funksiyasi
CREATE OR REPLACE FUNCTION check_payment_expiry()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- payment_valid_until o'tgan talabalarni unpaid qilish
  UPDATE students
  SET payment_status = 'unpaid'
  WHERE payment_valid_until < CURRENT_DATE
    AND payment_status = 'paid';
END;
$$;

-- Oylik to'lov qo'shish funksiyasi
CREATE OR REPLACE FUNCTION record_monthly_payment(
  p_student_id UUID,
  p_month TEXT,
  p_amount NUMERIC,
  p_method TEXT,
  p_note TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_year INTEGER;
  v_month_number INTEGER;
  v_payment_id UUID;
  v_expiry_date DATE;
BEGIN
  -- Oy va yilni ajratish
  v_year := EXTRACT(YEAR FROM TO_DATE(p_month, 'YYYY-MM'));
  v_month_number := EXTRACT(MONTH FROM TO_DATE(p_month, 'YYYY-MM'));
  
  -- To'lov muddati - keyingi oyning shu sanasi
  v_expiry_date := (TO_DATE(p_month, 'YYYY-MM') + INTERVAL '1 month')::DATE;
  
  -- Oylik to'lovni qo'shish yoki yangilash
  INSERT INTO monthly_payments (student_id, month, year, month_number, amount, method, note, status)
  VALUES (p_student_id, p_month, v_year, v_month_number, p_amount, p_method, p_note, 'paid')
  ON CONFLICT (student_id, month) 
  DO UPDATE SET 
    amount = EXCLUDED.amount,
    method = EXCLUDED.method,
    note = EXCLUDED.note,
    status = 'paid',
    payment_date = NOW(),
    updated_at = NOW()
  RETURNING id INTO v_payment_id;
  
  -- Talaba holatini yangilash
  UPDATE students
  SET 
    payment_status = 'paid',
    payment_valid_until = v_expiry_date,
    last_paid_month = p_month,
    updated_at = NOW()
  WHERE id = p_student_id;
  
  -- payment_history ga ham yozish (eski tizim uchun)
  INSERT INTO payment_history (student_id, amount, date, status, method, note)
  VALUES (p_student_id, p_amount, NOW(), 'paid', p_method, COALESCE(p_note, p_month || ' oyi uchun to''lov'));
  
  RETURN json_build_object(
    'success', true,
    'payment_id', v_payment_id,
    'expiry_date', v_expiry_date,
    'month', p_month
  );
END;
$$;

-- Talaba to'lov ma'lumotlari funksiyasi
CREATE OR REPLACE FUNCTION get_student_payment_info(p_student_id UUID)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_student RECORD;
  v_paid_months JSON;
  v_current_month TEXT;
  v_months_needed JSON;
BEGIN
  -- Joriy oy
  v_current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Talaba ma'lumotlari
  SELECT * INTO v_student FROM students WHERE id = p_student_id;
  
  -- To'langan oylar
  SELECT json_agg(json_build_object(
    'month', month,
    'amount', amount,
    'payment_date', payment_date,
    'status', status
  ) ORDER BY month DESC)
  INTO v_paid_months
  FROM monthly_payments
  WHERE student_id = p_student_id AND status = 'paid';
  
  -- To'lanmagan oylar (oxirgi 3 oy)
  WITH months AS (
    SELECT TO_CHAR(generate_series(
      DATE_TRUNC('month', CURRENT_DATE - INTERVAL '2 months'),
      DATE_TRUNC('month', CURRENT_DATE),
      '1 month'
    ), 'YYYY-MM') as month_str
  )
  SELECT json_agg(m.month_str ORDER BY m.month_str)
  INTO v_months_needed
  FROM months m
  LEFT JOIN monthly_payments mp ON mp.student_id = p_student_id AND mp.month = m.month_str AND mp.status = 'paid'
  WHERE mp.id IS NULL;
  
  RETURN json_build_object(
    'student_id', p_student_id,
    'current_status', v_student.payment_status,
    'valid_until', v_student.payment_valid_until,
    'last_paid_month', v_student.last_paid_month,
    'current_month', v_current_month,
    'paid_months', COALESCE(v_paid_months, '[]'::json),
    'months_needed', COALESCE(v_months_needed, '[]'::json),
    'is_expired', CASE 
      WHEN v_student.payment_valid_until IS NULL THEN true
      WHEN v_student.payment_valid_until < CURRENT_DATE THEN true
      ELSE false
    END
  );
END;
$$;

-- To'lov holatini avtomatik yangilash funksiyasi
CREATE OR REPLACE FUNCTION auto_check_payment_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Har qanday select/update da to'lov muddatini tekshirish
  IF NEW.payment_valid_until IS NOT NULL AND NEW.payment_valid_until < CURRENT_DATE THEN
    NEW.payment_status := 'unpaid';
  END IF;
  RETURN NEW;
END;
$$;

-- Test funksiyasi
CREATE OR REPLACE FUNCTION test_telegram_message(message_text TEXT DEFAULT 'Test xabar')
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN send_telegram_message(
    chat_id := '5865994146',
    message_text := message_text,
    bot_token := '8578440348:AAHM-FGbW6al3w8wyqSNTWTsCpolhxoJ1ls'
  );
END;
$$;

-- ============================================
-- 3. TRIGGERLAR
-- ============================================

DROP TRIGGER IF EXISTS update_teachers_updated_at ON teachers;
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_achievements_updated_at ON achievements;
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_blocks_updated_at ON content_blocks;
CREATE TRIGGER update_content_blocks_updated_at BEFORE UPDATE ON content_blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_stats_updated_at ON site_stats;
CREATE TRIGGER update_site_stats_updated_at BEFORE UPDATE ON site_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_gallery_items_updated_at ON gallery_items;
CREATE TRIGGER update_gallery_items_updated_at BEFORE UPDATE ON gallery_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_schedule_entries_updated_at ON schedule_entries;
CREATE TRIGGER update_schedule_entries_updated_at BEFORE UPDATE ON schedule_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_options_updated_at ON system_options;
CREATE TRIGGER update_system_options_updated_at 
  BEFORE UPDATE ON system_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_monthly_payments_updated_at ON monthly_payments;
CREATE TRIGGER update_monthly_payments_updated_at 
  BEFORE UPDATE ON monthly_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Telegram trigger'lar
DROP TRIGGER IF EXISTS trigger_notify_new_application ON applications;
CREATE TRIGGER trigger_notify_new_application
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_application();

DROP TRIGGER IF EXISTS trigger_notify_new_contact_message ON contact_messages;
CREATE TRIGGER trigger_notify_new_contact_message
  AFTER INSERT ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_contact_message();

-- To'lov holatini avtomatik tekshirish trigger'i
DROP TRIGGER IF EXISTS check_payment_on_update ON students;
CREATE TRIGGER check_payment_on_update
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION auto_check_payment_status();

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. POLICIES (Barcha jadvallar uchun)
-- ============================================

-- Public read permissions
DROP POLICY IF EXISTS "Public can read teachers" ON teachers;
CREATE POLICY "Public can read teachers" ON teachers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read courses" ON courses;
CREATE POLICY "Public can read courses" ON courses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read events" ON events;
CREATE POLICY "Public can read events" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read achievements" ON achievements;
CREATE POLICY "Public can read achievements" ON achievements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read applications" ON applications;
CREATE POLICY "Public can read applications" ON applications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read content blocks" ON content_blocks;
CREATE POLICY "Public can read content blocks" ON content_blocks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read site stats" ON site_stats;
CREATE POLICY "Public can read site stats" ON site_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read testimonials" ON testimonials;
CREATE POLICY "Public can read testimonials" ON testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read gallery items" ON gallery_items;
CREATE POLICY "Public can read gallery items" ON gallery_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read schedule entries" ON schedule_entries;
CREATE POLICY "Public can read schedule entries" ON schedule_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read groups" ON groups;
CREATE POLICY "Public can read groups" ON groups FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read students" ON students;
CREATE POLICY "Public can read students" ON students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read payment_history" ON payment_history;
CREATE POLICY "Public can read payment_history" ON payment_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read monthly_payments" ON monthly_payments;
CREATE POLICY "Public can read monthly_payments" ON monthly_payments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read revenue" ON revenue;
CREATE POLICY "Public can read revenue" ON revenue FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read expenses" ON expenses;
CREATE POLICY "Public can read expenses" ON expenses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read admins" ON admins;
CREATE POLICY "Public can read admins" ON admins FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read system_options" ON system_options;
CREATE POLICY "Public can read system_options" ON system_options FOR SELECT USING (true);

-- Public insert (development)
DROP POLICY IF EXISTS "Public can insert applications" ON applications;
CREATE POLICY "Public can insert applications" ON applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can insert contact messages" ON contact_messages;
CREATE POLICY "Public can insert contact messages"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Public full access (development - barcha jadvallar uchun)
DROP POLICY IF EXISTS "Public can manage teachers" ON teachers;
CREATE POLICY "Public can manage teachers" ON teachers FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage courses" ON courses;
CREATE POLICY "Public can manage courses" ON courses FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage events" ON events;
CREATE POLICY "Public can manage events" ON events FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage achievements" ON achievements;
CREATE POLICY "Public can manage achievements" ON achievements FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage applications" ON applications;
CREATE POLICY "Public can manage applications" ON applications FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage categories" ON categories;
CREATE POLICY "Public can manage categories" ON categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage content blocks" ON content_blocks;
CREATE POLICY "Public can manage content blocks" ON content_blocks FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage site stats" ON site_stats;
CREATE POLICY "Public can manage site stats" ON site_stats FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage testimonials" ON testimonials;
CREATE POLICY "Public can manage testimonials" ON testimonials FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage gallery items" ON gallery_items;
CREATE POLICY "Public can manage gallery items" ON gallery_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage schedule entries" ON schedule_entries;
CREATE POLICY "Public can manage schedule entries" ON schedule_entries FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage groups" ON groups;
CREATE POLICY "Public can manage groups" ON groups FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage students" ON students;
CREATE POLICY "Public can manage students" ON students FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage payment_history" ON payment_history;
CREATE POLICY "Public can manage payment_history" ON payment_history FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage monthly_payments" ON monthly_payments;
CREATE POLICY "Public can manage monthly_payments" ON monthly_payments FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage revenue" ON revenue;
CREATE POLICY "Public can manage revenue" ON revenue FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage expenses" ON expenses;
CREATE POLICY "Public can manage expenses" ON expenses FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage system_options" ON system_options;
CREATE POLICY "Public can manage system_options" ON system_options FOR ALL USING (true);

-- Admins uchun alohida policy
DROP POLICY IF EXISTS "public_all_admins" ON admins;
CREATE POLICY "public_all_admins" 
ON admins 
FOR ALL 
TO public
USING (true) 
WITH CHECK (true);

-- ============================================
-- 6. INDEXLAR
-- ============================================

CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_course_id ON groups(course_id);
CREATE INDEX IF NOT EXISTS idx_applications_course_id ON applications(course_id);
CREATE INDEX IF NOT EXISTS idx_achievements_course_id ON achievements(course_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured, is_published);
CREATE INDEX IF NOT EXISTS idx_teachers_featured ON teachers(featured);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured, is_published);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_content_blocks_section ON content_blocks(section, content_key, locale);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_schedule_entries_day ON schedule_entries(day_of_week);
CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);
CREATE INDEX IF NOT EXISTS idx_students_group_id ON students(group_id);
CREATE INDEX IF NOT EXISTS idx_students_payment_status ON students(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_history_student_id ON payment_history(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_date ON payment_history(date);
CREATE INDEX IF NOT EXISTS idx_monthly_payments_student_id ON monthly_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_monthly_payments_month ON monthly_payments(month);
CREATE INDEX IF NOT EXISTS idx_monthly_payments_status ON monthly_payments(status);
CREATE INDEX IF NOT EXISTS idx_revenue_month ON revenue(month);
CREATE INDEX IF NOT EXISTS idx_expenses_month ON expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_system_options_type ON system_options(option_type);

-- ============================================
-- 7. DEFAULT MA'LUMOTLAR
-- ============================================

-- Default adminlar
INSERT INTO admins (login, password, name)
VALUES ('admin', 'admin123', 'Admin User')
ON CONFLICT (login) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name;

-- System options - Kurs darajalari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('course_level', 'beginner', 'Boshlang''ich', 'Начальный', 'Beginner', 1),
('course_level', 'elementary', 'Elementar', 'Элементарный', 'Elementary', 2),
('course_level', 'intermediate', 'O''rta', 'Средний', 'Intermediate', 3),
('course_level', 'upper_intermediate', 'O''rta yuqori', 'Выше среднего', 'Upper Intermediate', 4),
('course_level', 'advanced', 'Yuqori', 'Продвинутый', 'Advanced', 5)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- System options - To'lov usullari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('payment_method', 'cash', 'Naqd pul', 'Наличные', 'Cash', 1),
('payment_method', 'card', 'Plastik karta', 'Банковская карта', 'Card', 2),
('payment_method', 'transfer', 'Bank o''tkazmasi', 'Банковский перевод', 'Bank Transfer', 3),
('payment_method', 'click', 'Click', 'Click', 'Click', 4),
('payment_method', 'payme', 'Payme', 'Payme', 'Payme', 5)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- System options - Guruh holatlari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('group_status', 'active', 'Faol', 'Активный', 'Active', 1),
('group_status', 'closed', 'Yopiq', 'Закрыт', 'Closed', 2),
('group_status', 'pending', 'Kutilmoqda', 'Ожидание', 'Pending', 3)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- System options - O'qituvchi holatlari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('teacher_status', 'active', 'Faol', 'Активный', 'Active', 1),
('teacher_status', 'inactive', 'Nofaol', 'Неактивный', 'Inactive', 2),
('teacher_status', 'vacation', 'Ta''tilda', 'В отпуске', 'On Vacation', 3)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- System options - To'lov holatlari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('payment_status', 'paid', 'To''langan', 'Оплачено', 'Paid', 1),
('payment_status', 'unpaid', 'To''lanmagan', 'Не оплачено', 'Unpaid', 2),
('payment_status', 'partial', 'Qisman', 'Частично', 'Partial', 3)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- System options - Ariza holatlari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('application_status', 'pending', 'Kutilmoqda', 'Ожидание', 'Pending', 1),
('application_status', 'contacted', 'Bog''lanildi', 'Связались', 'Contacted', 2),
('application_status', 'approved', 'Tasdiqlangan', 'Одобрено', 'Approved', 3),
('application_status', 'rejected', 'Rad etilgan', 'Отклонено', 'Rejected', 4),
('application_status', 'enrolled', 'Qabul qilingan', 'Зачислен', 'Enrolled', 5)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- System options - Dars formatlari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('lesson_format', 'offline', 'Oflayn', 'Офлайн', 'Offline', 1),
('lesson_format', 'online', 'Onlayn', 'Онлайн', 'Online', 2),
('lesson_format', 'hybrid', 'Aralash', 'Гибрид', 'Hybrid', 3)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- System options - Kurs kategoriyalari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('course_category', 'english', 'Ingliz tili', 'Английский язык', 'English', 1),
('course_category', 'programming', 'Dasturlash', 'Программирование', 'Programming', 2),
('course_category', 'math', 'Matematika', 'Математика', 'Mathematics', 3),
('course_category', 'science', 'Fan', 'Наука', 'Science', 4)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- System options - Tadbir kategoriyalari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('event_category', 'workshop', 'Workshop', 'Воркшоп', 'Workshop', 1),
('event_category', 'seminar', 'Seminar', 'Семинар', 'Seminar', 2),
('event_category', 'competition', 'Musobaqa', 'Соревнование', 'Competition', 3),
('event_category', 'celebration', 'Bayram', 'Праздник', 'Celebration', 4)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- ============================================
-- 8. VIEWS
-- ============================================

-- Talabalar to'lov holati view
CREATE OR REPLACE VIEW student_payment_status AS
SELECT 
  s.id,
  s.full_name,
  s.monthly_payment,
  s.payment_status,
  s.payment_valid_until,
  s.last_paid_month,
  CASE 
    WHEN s.payment_valid_until IS NULL THEN true
    WHEN s.payment_valid_until < CURRENT_DATE THEN true
    ELSE false
  END as is_expired,
  s.payment_valid_until - CURRENT_DATE as days_remaining,
  TO_CHAR(CURRENT_DATE, 'YYYY-MM') as current_month,
  (
    SELECT json_agg(json_build_object(
      'month', mp.month,
      'status', mp.status,
      'amount', mp.amount
    ) ORDER BY mp.month DESC)
    FROM monthly_payments mp
    WHERE mp.student_id = s.id
  ) as payment_history
FROM students s;

-- ============================================
-- 9. STORAGE BUCKET (Rasmlar uchun)
-- ============================================
-- Eslatma: Storage bucket SQL orqali to'g'ridan-to'g'ri yaratilmaydi
-- Supabase Dashboard → Storage → Create bucket orqali yaratish kerak
-- Bucket nomi: 'images'
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/*

-- Storage policies (agar bucket mavjud bo'lsa)
-- Public full access (development)
DROP POLICY IF EXISTS "Public full access" ON storage.objects;
CREATE POLICY "Public full access"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');

-- ============================================
-- 10. TEKSHIRISH
-- ============================================

-- Adminlar tekshirish
SELECT '✅ Admins jadvali mavjud va sozlandi!' as status;

SELECT 
  login, 
  name, 
  created_at,
  CASE 
    WHEN password IS NOT NULL THEN 'Parol mavjud'
    ELSE 'Parol yo''q'
  END as password_status
FROM admins
ORDER BY created_at DESC;

-- Barcha jadvallar ro'yxati
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Jadval strukturalari
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('teachers', 'courses', 'events', 'students', 'groups', 'admins')
ORDER BY table_name, ordinal_position;

-- RLS policy'larni ko'rsatish
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- TAYYOR!
-- ============================================
-- Barcha jadvallar, functionlar, triggerlar va policies yaratildi
-- Endi loyiha Supabase bilan to'liq ishlaydi
-- ============================================

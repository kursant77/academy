-- ============================================
-- TO'LIQ DATABASE TUZATISH - BARCHA XATOLAR UCHUN
-- Supabase SQL Editor'da ishga tushiring
-- ============================================

-- 1. TEACHERS jadvaliga ustunlar qo'shish
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS monthly_salary NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. STUDENTS jadvaliga ustunlar qo'shish
ALTER TABLE students ADD COLUMN IF NOT EXISTS monthly_payment NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE students ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid';
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_name TEXT DEFAULT '';
ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_contact TEXT DEFAULT '';
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS notes TEXT;

-- 3. REVENUE jadvalni to'g'ri yaratish (month TEXT bo'lishi kerak)
DROP TABLE IF EXISTS revenue CASCADE;
CREATE TABLE revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM formatda
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. EXPENSES jadvalni to'g'ri yaratish (month TEXT bo'lishi kerak)
DROP TABLE IF EXISTS expenses CASCADE;
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM formatda
  description TEXT,
  type TEXT NOT NULL DEFAULT 'variable',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ADMINS jadvali
CREATE TABLE IF NOT EXISTS admins (
  login TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. GROUPS jadvali
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teacher_id UUID,
  schedule TEXT DEFAULT '',
  room TEXT DEFAULT '',
  max_students INTEGER DEFAULT 12,
  current_students INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  attendance_rate INTEGER DEFAULT 85,
  monthly_revenue NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PAYMENT_HISTORY jadvali
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID,
  amount NUMERIC(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'paid',
  method TEXT DEFAULT 'cash',
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- RLS SIYOSATLARINI OCHISH
-- ============================================

-- Teachers
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_teachers" ON teachers;
CREATE POLICY "public_all_teachers" ON teachers FOR ALL USING (true) WITH CHECK (true);

-- Students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_students" ON students;
CREATE POLICY "public_all_students" ON students FOR ALL USING (true) WITH CHECK (true);

-- Groups
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_groups" ON groups;
CREATE POLICY "public_all_groups" ON groups FOR ALL USING (true) WITH CHECK (true);

-- Revenue
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_revenue" ON revenue;
CREATE POLICY "public_all_revenue" ON revenue FOR ALL USING (true) WITH CHECK (true);

-- Expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_expenses" ON expenses;
CREATE POLICY "public_all_expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

-- Payment History
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_payment_history" ON payment_history;
CREATE POLICY "public_all_payment_history" ON payment_history FOR ALL USING (true) WITH CHECK (true);

-- Admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_admins" ON admins;
CREATE POLICY "public_all_admins" ON admins FOR ALL USING (true) WITH CHECK (true);

-- Courses
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_courses" ON courses;
CREATE POLICY "public_all_courses" ON courses FOR ALL USING (true) WITH CHECK (true);

-- Applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all_applications" ON applications;
CREATE POLICY "public_all_applications" ON applications FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- TEST MA'LUMOTLAR
-- ============================================

-- Admin
INSERT INTO admins (login, password, name)
VALUES ('admin', 'admin123', 'Administrator')
ON CONFLICT (login) DO UPDATE SET password = 'admin123';

-- O'qituvchi (agar yo'q bo'lsa)
INSERT INTO teachers (name, specialty, specialty_uz, specialty_ru, specialty_en, experience, bio, bio_uz, bio_ru, bio_en, status, monthly_salary)
SELECT 'Test O''qituvchi', 'Ingliz tili', 'Ingliz tili', 'Английский', 'English', 3, 'Bio', 'Bio', 'Био', 'Bio', 'active', 2000000
WHERE NOT EXISTS (SELECT 1 FROM teachers LIMIT 1);

-- Kurs (agar yo'q bo'lsa)
INSERT INTO courses (name, name_uz, name_ru, name_en, description, description_uz, description_ru, description_en, category, duration, price, level, schedule, teacher_id, is_published)
SELECT 'Ingliz tili', 'Ingliz tili', 'Английский язык', 'English', 'Kurs', 'Kurs', 'Курс', 'Course', 'Tillar', '3 oy', '500000', 'Boshlang''ich', '14:00-16:00', (SELECT id FROM teachers LIMIT 1), true
WHERE NOT EXISTS (SELECT 1 FROM courses LIMIT 1);

-- ============================================
-- TEKSHIRISH
-- ============================================
SELECT 'Tayyor! Barcha jadvallar sozlandi.' as status;

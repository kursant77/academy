-- ============================================
-- TO'LIQ DATABASE SETUP - BARCHA JADVALLAR VA SOZLAMALAR
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
ALTER TABLE revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Public can read revenue" ON revenue;
CREATE POLICY "Public can read revenue" ON revenue FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read expenses" ON expenses;
CREATE POLICY "Public can read expenses" ON expenses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can read admins" ON admins;
CREATE POLICY "Public can read admins" ON admins FOR SELECT USING (true);

-- Public insert (development)
DROP POLICY IF EXISTS "Public can insert applications" ON applications;
CREATE POLICY "Public can insert applications" ON applications FOR INSERT WITH CHECK (true);

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

DROP POLICY IF EXISTS "Public can manage revenue" ON revenue;
CREATE POLICY "Public can manage revenue" ON revenue FOR ALL USING (true);

DROP POLICY IF EXISTS "Public can manage expenses" ON expenses;
CREATE POLICY "Public can manage expenses" ON expenses FOR ALL USING (true);

-- ============================================
-- 6. INDEXLAR
-- ============================================

CREATE INDEX IF NOT EXISTS idx_courses_teacher_id ON courses(teacher_id);
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
CREATE INDEX IF NOT EXISTS idx_revenue_month ON revenue(month);
CREATE INDEX IF NOT EXISTS idx_expenses_month ON expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- ============================================
-- 7. DEFAULT MA'LUMOTLAR
-- ============================================

-- Default adminlar
INSERT INTO admins (login, password, name)
VALUES ('admin', 'admin123', 'Admin User')
ON CONFLICT (login) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name;

INSERT INTO admins (login, password, name)
VALUES ('test', 'test123', 'Test Admin')
ON CONFLICT (login) DO UPDATE SET
  password = EXCLUDED.password,
  name = EXCLUDED.name;

-- ============================================
-- 8. STORAGE BUCKET (Rasmlar uchun)
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
-- 9. TEKSHIRISH
-- ============================================

-- Adminlar tekshirish
SELECT login, password, name, created_at FROM admins;

-- Barcha jadvallar ro'yxati
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- TAYYOR!
-- ============================================
-- Barcha jadvallar, functionlar, triggerlar va policies yaratildi
-- Endi loyiha Supabase bilan to'liq ishlaydi
-- ============================================


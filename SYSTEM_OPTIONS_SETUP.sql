-- ============================================
-- TIZIM SOZLAMALARI - SELECT OPTIONLAR
-- ============================================

-- System options jadvali
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

-- Index
CREATE INDEX IF NOT EXISTS idx_system_options_type ON system_options(option_type);

-- Trigger
DROP TRIGGER IF EXISTS update_system_options_updated_at ON system_options;
CREATE TRIGGER update_system_options_updated_at 
  BEFORE UPDATE ON system_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE system_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read system_options" ON system_options;
CREATE POLICY "Public can read system_options" ON system_options FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can manage system_options" ON system_options;
CREATE POLICY "Public can manage system_options" ON system_options FOR ALL USING (true);

-- ============================================
-- DEFAULT MA'LUMOTLAR
-- ============================================

-- Kurs darajalari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('course_level', 'beginner', 'Boshlang''ich', 'Начальный', 'Beginner', 1),
('course_level', 'elementary', 'Elementar', 'Элементарный', 'Elementary', 2),
('course_level', 'intermediate', 'O''rta', 'Средний', 'Intermediate', 3),
('course_level', 'upper_intermediate', 'O''rta yuqori', 'Выше среднего', 'Upper Intermediate', 4),
('course_level', 'advanced', 'Yuqori', 'Продвинутый', 'Advanced', 5)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- To'lov usullari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('payment_method', 'cash', 'Naqd pul', 'Наличные', 'Cash', 1),
('payment_method', 'card', 'Plastik karta', 'Банковская карта', 'Card', 2),
('payment_method', 'transfer', 'Bank o''tkazmasi', 'Банковский перевод', 'Bank Transfer', 3),
('payment_method', 'click', 'Click', 'Click', 'Click', 4),
('payment_method', 'payme', 'Payme', 'Payme', 'Payme', 5)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- Guruh holatlari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('group_status', 'active', 'Faol', 'Активный', 'Active', 1),
('group_status', 'closed', 'Yopiq', 'Закрыт', 'Closed', 2),
('group_status', 'pending', 'Kutilmoqda', 'Ожидание', 'Pending', 3)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- O'qituvchi holatlari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('teacher_status', 'active', 'Faol', 'Активный', 'Active', 1),
('teacher_status', 'inactive', 'Nofaol', 'Неактивный', 'Inactive', 2),
('teacher_status', 'vacation', 'Ta''tilda', 'В отпуске', 'On Vacation', 3)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- To'lov holatlari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('payment_status', 'paid', 'To''langan', 'Оплачено', 'Paid', 1),
('payment_status', 'unpaid', 'To''lanmagan', 'Не оплачено', 'Unpaid', 2),
('payment_status', 'partial', 'Qisman', 'Частично', 'Partial', 3)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- Ariza holatlari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('application_status', 'pending', 'Kutilmoqda', 'Ожидание', 'Pending', 1),
('application_status', 'contacted', 'Bog''lanildi', 'Связались', 'Contacted', 2),
('application_status', 'approved', 'Tasdiqlangan', 'Одобрено', 'Approved', 3),
('application_status', 'rejected', 'Rad etilgan', 'Отклонено', 'Rejected', 4),
('application_status', 'enrolled', 'Qabul qilingan', 'Зачислен', 'Enrolled', 5)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- Dars formatlari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('lesson_format', 'offline', 'Oflayn', 'Офлайн', 'Offline', 1),
('lesson_format', 'online', 'Onlayn', 'Онлайн', 'Online', 2),
('lesson_format', 'hybrid', 'Aralash', 'Гибрид', 'Hybrid', 3)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- Kurs kategoriyalari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('course_category', 'english', 'Ingliz tili', 'Английский язык', 'English', 1),
('course_category', 'programming', 'Dasturlash', 'Программирование', 'Programming', 2),
('course_category', 'math', 'Matematika', 'Математика', 'Mathematics', 3),
('course_category', 'science', 'Fan', 'Наука', 'Science', 4)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- Tadbir kategoriyalari
INSERT INTO system_options (option_type, option_key, name_uz, name_ru, name_en, sort_order) VALUES
('event_category', 'workshop', 'Workshop', 'Воркшоп', 'Workshop', 1),
('event_category', 'seminar', 'Seminar', 'Семинар', 'Seminar', 2),
('event_category', 'competition', 'Musobaqa', 'Соревнование', 'Competition', 3),
('event_category', 'celebration', 'Bayram', 'Праздник', 'Celebration', 4)
ON CONFLICT (option_type, option_key) DO NOTHING;

-- ============================================
-- TAYYOR!
-- ============================================

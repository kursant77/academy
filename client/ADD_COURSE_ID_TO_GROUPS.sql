-- ============================================
-- GROUPS JADVALIGA COURSE_ID USTUNINI QO'SHISH
-- ============================================
-- Bu migration groups jadvaliga course_id ustunini qo'shadi
-- va kurslar bilan guruhlarni bog'laydi
-- ============================================

-- 1. Groups jadvaliga course_id ustunini qo'shish (agar mavjud bo'lmasa)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'groups' AND column_name = 'course_id'
  ) THEN
    ALTER TABLE groups 
    ADD COLUMN course_id UUID;
  END IF;
END $$;

-- 2. Foreign key constraint yaratish (agar mavjud bo'lmasa)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'groups_course_id_fkey' 
    AND table_name = 'groups'
  ) THEN
    ALTER TABLE groups 
    ADD CONSTRAINT groups_course_id_fkey 
    FOREIGN KEY (course_id) 
    REFERENCES courses(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Index qo'shish (performance uchun)
CREATE INDEX IF NOT EXISTS idx_groups_course_id ON groups(course_id);

-- 4. Supabase PostgREST API uchun foreign key relationship'ni yangilash
-- Bu Supabase'ga relationship'ni bildiradi
COMMENT ON COLUMN groups.course_id IS 'Foreign key to courses table';

-- ============================================
-- TUGADI
-- ============================================
-- Endi groups jadvalida course_id ustuni mavjud
-- va guruhlar kurslar bilan bog'lanishi mumkin
-- Supabase PostgREST API endi bu relationship'ni taniydi


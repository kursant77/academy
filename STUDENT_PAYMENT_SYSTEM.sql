-- ============================================
-- TALABALAR TO'LOV TIZIMI - OYLIK TRACKING
-- ============================================
-- Bu fayl oylik to'lov tizimini yaratadi:
-- 1. Har bir oy uchun alohida to'lov tracking
-- 2. 1 oydan keyin avtomatik deaktivatsiya
-- 3. Qaysi oylar to'langanligi ko'rsatish
-- ============================================

-- ============================================
-- 1. STUDENTS JADVALINI YANGILASH
-- ============================================

-- Yangi ustunlar qo'shish
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS payment_valid_until DATE,
ADD COLUMN IF NOT EXISTS last_paid_month TEXT,
ADD COLUMN IF NOT EXISTS course_name TEXT;

-- ============================================
-- 2. MONTHLY_PAYMENTS JADVALI (Oylik to'lovlar)
-- ============================================

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

-- Index qo'shish
CREATE INDEX IF NOT EXISTS idx_monthly_payments_student_id ON monthly_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_monthly_payments_month ON monthly_payments(month);
CREATE INDEX IF NOT EXISTS idx_monthly_payments_status ON monthly_payments(status);

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_monthly_payments_updated_at ON monthly_payments;
CREATE TRIGGER update_monthly_payments_updated_at 
  BEFORE UPDATE ON monthly_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. FUNCTION: TO'LOV HOLATINI TEKSHIRISH
-- ============================================

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

-- ============================================
-- 4. FUNCTION: OYLIK TO'LOV QO'SHISH
-- ============================================

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

-- ============================================
-- 5. FUNCTION: TALABA TO'LOV MA'LUMOTLARI
-- ============================================

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

-- ============================================
-- 6. CRON JOB: HAR KUN TEKSHIRISH (pg_cron orqali)
-- ============================================
-- Eslatma: Bu Supabase'da pg_cron extension yoqilgan bo'lishi kerak
-- Aks holda, quyidagi kod ishlamaydi

-- pg_cron mavjudligini tekshirish
DO $$
BEGIN
  -- Har kuni ertalab 00:01 da to'lov muddatini tekshirish
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule('check-payment-expiry', '1 0 * * *', 'SELECT check_payment_expiry()');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron extension mavjud emas. Manual cron ishlatiladi.';
END;
$$;

-- ============================================
-- 7. TRIGGER: TO'LOV HOLATINI AVTOMATIK YANGILASH
-- ============================================

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

DROP TRIGGER IF EXISTS check_payment_on_update ON students;
CREATE TRIGGER check_payment_on_update
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION auto_check_payment_status();

-- ============================================
-- 8. RLS POLICIES
-- ============================================

ALTER TABLE monthly_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read monthly_payments" ON monthly_payments;
CREATE POLICY "Public can read monthly_payments" ON monthly_payments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can manage monthly_payments" ON monthly_payments;
CREATE POLICY "Public can manage monthly_payments" ON monthly_payments FOR ALL USING (true);

-- ============================================
-- 9. VIEW: TALABALAR TO'LOV HOLATI
-- ============================================

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
-- 10. MAVJUD TALABALAR UCHUN DEFAULT QIYMATLAR
-- ============================================

-- Hozirgi "paid" holatidagi talabalar uchun expiry date o'rnatish
UPDATE students
SET 
  payment_valid_until = (CURRENT_DATE + INTERVAL '1 month')::DATE,
  last_paid_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM')
WHERE payment_status = 'paid' AND payment_valid_until IS NULL;

-- ============================================
-- TAYYOR!
-- ============================================
-- Supabase SQL Editor'da ishga tushiring
-- ============================================


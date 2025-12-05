-- Telegram Bot - Database Trigger (CORS muammosiz yechim)
-- Bu SQL skript database trigger yaratadi va CORS muammosini to'liq hal qiladi
-- Chunki trigger server-side'da ishlaydi, CORS cheklovlari yo'q

-- 1. pg_net extension'ni yoqish (agar mavjud bo'lmasa)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Telegram xabar yuborish funksiyasini yaratish
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

-- 3. Applications jadvali uchun trigger function
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
  SELECT COALESCE(name_uz, name_ru, name_en, 'Noma\'lum kurs')
  INTO course_name
  FROM courses
  WHERE id = NEW.course_id;

  -- Telegram xabarini formatlash
  telegram_message := format(
    E'🆕 <b>Yangi ro\'yxatdan o\'tish</b>\n\n' ||
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
END;
$$;

-- 4. Contact messages jadvali uchun trigger function (agar jadval mavjud bo'lsa)
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
END;
$$;

-- 5. Contact messages jadvalini yaratish (agar mavjud bo'lmasa)
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Trigger'lar yaratish
-- Applications uchun trigger
DROP TRIGGER IF EXISTS trigger_notify_new_application ON applications;
CREATE TRIGGER trigger_notify_new_application
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_application();

-- Contact messages uchun trigger
DROP TRIGGER IF EXISTS trigger_notify_new_contact_message ON contact_messages;
CREATE TRIGGER trigger_notify_new_contact_message
  AFTER INSERT ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_contact_message();

-- 7. RLS (Row Level Security) sozlamalari
-- Contact messages jadvali uchun public yozish ruxsati
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert contact messages" ON contact_messages;
CREATE POLICY "Public can insert contact messages"
  ON contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 8. Test qilish uchun funksiya
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
-- Foydalanish:
-- ============================================

-- 1. Test qilish:
-- SELECT test_telegram_message('Salom, bu test xabar!');

-- 2. Qo'lda xabar yuborish:
-- SELECT send_telegram_message(
--   chat_id := '5865994146',
--   message_text := 'Xabar matni',
--   bot_token := '8578440348:AAHM-FGbW6al3w8wyqSNTWTsCpolhxoJ1ls'
-- );

-- 3. Applications jadvaliga yangi yozuv qo'shilganda avtomatik Telegram'ga xabar ketadi
-- 4. Contact messages jadvaliga yangi yozuv qo'shilganda avtomatik Telegram'ga xabar ketadi

-- ============================================
-- Eslatmalar:
-- ============================================
-- ✅ CORS muammosi yo'q - trigger server-side'da ishlaydi
-- ✅ Hech qanday Edge Function kerak emas
-- ✅ Frontend kod o'zgartirish kerak emas
-- ✅ Avtomatik ishlaydi - yangi yozuv qo'shilganda xabar ketadi


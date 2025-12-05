-- Telegram bot xabarlarini yuborish uchun Database Function
-- Bu function Supabase Database'da trigger orqali avtomatik Telegram xabar yuboradi

-- 1. pg_net extension'ni yoqish (agar mavjud bo'lmasa)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Telegram xabar yuborish funksiyasini yaratish
CREATE OR REPLACE FUNCTION send_telegram_message(
  chat_id TEXT,
  message_text TEXT,
  bot_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response_status INTEGER;
BEGIN
  -- Telegram Bot API ga so'rov yuborish
  SELECT status INTO response_status
  FROM net.http_post(
    url := format('https://api.telegram.org/bot%s/sendMessage', bot_token),
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'chat_id', chat_id,
      'text', message_text,
      'parse_mode', 'HTML'
    )
  );
  
  RETURN response_status = 200;
EXCEPTION
  WHEN OTHERS THEN
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
  bot_token TEXT := '8578440348:AAHM-FGbW6al3w8wyqSNTWTsCpolhxoJ1ls';
  chat_id TEXT := '5865994146';
BEGIN
  -- Kurs nomini olish
  SELECT COALESCE(c.name_uz, c.name_ru, c.name_en, 'Noma''lum kurs')
  INTO course_name
  FROM courses c
  WHERE c.id = NEW.course_id
  LIMIT 1;
  
  -- Telegram xabarini formatlash
  telegram_message := format(
    E'🆕 <b>Yangi ro''yxatdan o''tish</b>\n\n'
    E'👤 <b>Ism:</b> %s\n'
    E'📅 <b>Yosh:</b> %s\n'
    E'📱 <b>Telefon:</b> %s\n'
    E'📚 <b>Kurs:</b> %s\n\n'
    E'⏰ <i>Vaqt: %s</i>',
    NEW.full_name,
    NEW.age::TEXT,
    NEW.phone,
    COALESCE(course_name, 'Kurs tanlanmagan'),
    to_char(NEW.created_at, 'DD.MM.YYYY, HH24:MI:SS')
  );
  
  -- Telegram xabarini yuborish (async - xatolik bo'lsa ham continue qiladi)
  PERFORM send_telegram_message(chat_id, telegram_message, bot_token);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Xatolik bo'lsa ham, application qo'shilishini to'xtatmaydi
    RAISE WARNING 'Telegram xabar yuborishda xatolik: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. Trigger'ni yaratish
DROP TRIGGER IF EXISTS trigger_notify_new_application ON applications;
CREATE TRIGGER trigger_notify_new_application
AFTER INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION notify_new_application();

-- 5. Contact messages uchun jadval yaratish (agar mavjud bo'lmasa)
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Contact messages uchun RLS policy
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public yozishi mumkin
CREATE POLICY "Public can insert contact messages"
ON contact_messages
FOR INSERT
TO public
WITH CHECK (true);

-- Faqat admin o'qishi mumkin
CREATE POLICY "Admins can read contact messages"
ON contact_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admins
    WHERE admins.user_id = auth.uid()
  )
);

-- 7. Contact messages uchun trigger function
CREATE OR REPLACE FUNCTION notify_new_contact_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  telegram_message TEXT;
  bot_token TEXT := '8578440348:AAHM-FGbW6al3w8wyqSNTWTsCpolhxoJ1ls';
  chat_id TEXT := '5865994146';
BEGIN
  -- Telegram xabarini formatlash
  telegram_message := format(
    E'📧 <b>Yangi xabar (Aloqa)</b>\n\n'
    E'👤 <b>Ism:</b> %s\n'
    E'📮 <b>Email:</b> %s\n'
    E'💬 <b>Xabar:</b>\n\n'
    E'%s\n\n'
    E'⏰ <i>Vaqt: %s</i>',
    NEW.name,
    NEW.email,
    NEW.message,
    to_char(NEW.created_at, 'DD.MM.YYYY, HH24:MI:SS')
  );
  
  -- Telegram xabarini yuborish
  PERFORM send_telegram_message(chat_id, telegram_message, bot_token);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Telegram xabar yuborishda xatolik: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 8. Contact messages uchun trigger
DROP TRIGGER IF EXISTS trigger_notify_new_contact_message ON contact_messages;
CREATE TRIGGER trigger_notify_new_contact_message
AFTER INSERT ON contact_messages
FOR EACH ROW
EXECUTE FUNCTION notify_new_contact_message();

# Telegram Bot - SQL Trigger Yechimi (CORS Muammosiz)

## ✅ Yechim

Bu yechim **database trigger** ishlatadi va **CORS muammosi umuman bo'lmaydi**, chunki trigger server-side'da ishlaydi.

## 📋 Qadamlar

### 1. SQL Skriptni Ishga Tushirish

1. **Supabase Dashboard** ga kiring
2. **SQL Editor** ga o'ting
3. **`TELEGRAM_TRIGGER_SQL.sql`** faylini oching
4. Barcha SQL kodini nusxalab SQL Editor'ga yopishtiring
5. **Run** tugmasini bosing

### 2. Nima Qiladi?

SQL skript quyidagilarni yaratadi:

1. ✅ **pg_net extension** - HTTP so'rovlar yuborish uchun
2. ✅ **send_telegram_message function** - Telegram API ga xabar yuboradi
3. ✅ **notify_new_application function** - Registratsiya uchun trigger
4. ✅ **notify_new_contact_message function** - Aloqa formasi uchun trigger
5. ✅ **contact_messages jadvali** - Agar mavjud bo'lmasa yaratadi
6. ✅ **Trigger'lar** - Avtomatik Telegram xabar yuboradi

### 3. Frontend Kod

Frontend kod **o'zgartirildi**:
- ✅ `register.tsx` - Faqat database'ga saqlaydi, trigger avtomatik xabar yuboradi
- ✅ `contact.tsx` - Faqat database'ga saqlaydi, trigger avtomatik xabar yuboradi
- ✅ Edge Function chaqiruvlari olib tashlandi

## 🧪 Test Qilish

### 1. Test Funksiyasini Ishlatish

SQL Editor'da:

```sql
SELECT test_telegram_message('Salom, bu test xabar!');
```

Agar `true` qaytsa, function to'g'ri ishlayapti!

### 2. Websaytda Test

1. Websaytga o'ting: `http://localhost:5173`
2. `/register` formasini to'ldiring va yuboring
3. Telegram bot'ga xabar kelganini tekshiring!

Yoki:

1. `/contact` formasini to'ldiring va yuboring
2. Telegram bot'ga xabar kelganini tekshiring!

## ✅ Afzalliklari

- ✅ **CORS muammosi yo'q** - Server-side'da ishlaydi
- ✅ **Edge Function kerak emas** - Faqat database trigger
- ✅ **Avtomatik ishlaydi** - Yangi yozuv qo'shilganda xabar ketadi
- ✅ **Xavfsiz** - Server-side'da ishlaydi, token xavfsiz
- ✅ **Oson** - Bitta SQL skript bajariladi

## 🔍 Muammo Bo'lsa

### pg_net extension yoqilmadi

1. SQL Editor'da quyidagini ishga tushiring:
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

2. Agar xatolik bersa, Supabase Dashboard → Database → Extensions bo'limiga o'ting
3. `pg_net` extension'ni qidiring va yoqing

### Trigger ishlamayapti

1. SQL Editor'da trigger'lar mavjudligini tekshiring:
```sql
SELECT * FROM pg_trigger WHERE tgname LIKE '%telegram%';
```

2. Function'lar mavjudligini tekshiring:
```sql
SELECT * FROM pg_proc WHERE proname LIKE '%telegram%';
```

### Xabar kelmayapti

1. **Logs** ni tekshiring: Supabase Dashboard → Logs → Postgres Logs
2. **Test funksiyasini** ishlatib ko'ring:
```sql
SELECT test_telegram_message('Test');
```

## 📝 Qo'shimcha Ma'lumot

### Qo'lda Xabar Yuborish

Agar qo'lda xabar yubormoqchi bo'lsangiz:

```sql
SELECT send_telegram_message(
  chat_id := '5865994146',
  message_text := 'Xabar matni',
  bot_token := '8578440348:AAHM-FGbW6al3w8wyqSNTWTsCpolhxoJ1ls'
);
```

### Trigger'ni O'chirish (Agar Kerak Bo'lsa)

```sql
DROP TRIGGER IF EXISTS trigger_notify_new_application ON applications;
DROP TRIGGER IF EXISTS trigger_notify_new_contact_message ON contact_messages;
```

---

**SQL skriptni ishga tushirib, websaytda test qiling!** 🚀

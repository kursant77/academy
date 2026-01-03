# Telegram Bot Sozlash - Chat ID Muammosini Hal Qilish

## "chat not found" Xatosi

Bu xato quyidagi sabablarga ko'ra yuzaga kelishi mumkin:

### 1. Chat ID ni Olish

#### Shaxsiy Chat (Foydalanuvchi) - MUHIM!

**QADAM 1:** Bot'ga `/start` yuborish (MAJBURIY!)
1. Telegram'da o'z bot'ingizga o'ting (masalan: `@your_bot_username`)
2. Bot'ga `/start` yuboring
3. Bot javob berishi kerak

**QADAM 2:** Chat ID ni olish
1. Telegram'da `@userinfobot` ga yozing
2. Bot sizga Chat ID ni yuboradi (masalan: `5865994146`)
3. Bu raqamni `.env` faylida `VITE_TELEGRAM_CHAT_ID` ga qo'ying

**Yoki:**
1. Telegram'da `@RawDataBot` ga yozing
2. Bot sizga JSON ma'lumotlarini yuboradi
3. `id` maydonidagi raqamni oling

**⚠️ MUHIM:** Agar bot'ga `/start` yubormasangiz, "chat not found" xatosi olasiz!

#### Gruh Chat
1. Gruhga `@userinfobot` ni qo'shing
2. Bot sizga gruh Chat ID ni yuboradi (odatda manfiy raqam, masalan: `-1001234567890`)

#### Channel Chat
1. Channel'ga bot'ni admin qiling
2. `@userinfobot` ni channel'ga qo'shing
3. Bot sizga channel Chat ID ni yuboradi

### 2. Bot Token ni Tekshirish

1. Telegram'da `@BotFather` ga yozing
2. `/mybots` buyrug'ini yuboring
3. Sizning bot'ingizni tanlang
4. `API Token` ni ko'ring va `.env` faylida `VITE_TELEGRAM_BOT_TOKEN` ga qo'ying

### 3. Bot bilan Chat Boshlash (Shaxsiy Chat uchun) - MAJBURIY!

**Bu qadamni o'tkazib yubormaslik kerak!**

Agar shaxsiy chat'ga xabar yubormoqchi bo'lsangiz:

1. **Bot'ga `/start` yuboring** (MAJBURIY!)
   - Telegram'da o'z bot'ingizga o'ting
   - Bot'ga `/start` yuboring
   - Bot javob berishi kerak

2. **Keyin Chat ID ni oling**
   - `@userinfobot` ga yozing
   - Chat ID ni oling

3. **`.env` faylida `VITE_TELEGRAM_CHAT_ID` ga qo'ying**

**⚠️ Eslatma:** Agar bot'ga `/start` yubormasangiz, bot sizga xabar yubora olmaydi va "chat not found" xatosi olasiz!

### 4. Gruh/Channel uchun

1. Bot'ni gruh yoki channel'ga qo'shing
2. Bot'ni **admin** qiling (xususan, "Send Messages" huquqini bering)
3. Chat ID ni oling (odatda manfiy raqam)
4. `.env` faylida `VITE_TELEGRAM_CHAT_ID` ga qo'ying

## .env Fayli

`.env` faylida quyidagilarni qo'shing:

```env
VITE_TELEGRAM_BOT_TOKEN=your_bot_token_here
VITE_TELEGRAM_CHAT_ID=your_chat_id_here
```

**Muhim:**
- Chat ID raqam sifatida yozilishi kerak (qo'shtirnoqsiz)
- Shaxsiy chat: ijobiy raqam (masalan: `123456789`)
- Gruh/Channel: manfiy raqam (masalan: `-1001234567890`)

## Test Qilish

1. `.env` faylini to'ldiring
2. Development server'ni qayta ishga tushiring: `npm run dev`
3. `/register` formasini to'ldiring va yuboring
4. Browser console'da xatoliklar bo'lmasligi kerak
5. Telegram'da xabar kelsa, barcha narsa ishlayapti!

## Muammolar

### Xato: "chat not found" (Eng keng tarqalgan muammo)

**Sabab:** Bot foydalanuvchi bilan chat boshlagan emas yoki Chat ID noto'g'ri.

**Hal qilish:**

1. **Bot'ga `/start` yuborish (MAJBURIY!):**
   ```
   Telegram → Bot'ingizga o'ting → /start yuboring
   ```

2. **Chat ID ni qayta olish:**
   ```
   Telegram → @userinfobot ga yozing → Chat ID ni oling
   ```

3. **`.env` faylini yangilash:**
   ```env
   VITE_TELEGRAM_CHAT_ID=your_correct_chat_id
   ```

4. **Development server'ni qayta ishga tushirish:**
   ```bash
   npm run dev
   ```

**Tekshirish:**
- ✅ Chat ID to'g'riligini tekshiring
- ✅ Shaxsiy chat bo'lsa, bot'ga `/start` yuborilganligini tekshiring (MAJBURIY!)
- ✅ Gruh/Channel bo'lsa, bot admin ekanligini tekshiring
- ✅ Bot token to'g'riligini tekshiring

### Xato: "Unauthorized"
- ✅ Bot token to'g'riligini tekshiring
- ✅ Token'da bo'sh joylar bo'lmasligi kerak

### Xato: "Forbidden: bot was blocked by the user"
- ✅ Foydalanuvchi bot'ni blok qilmaganligini tekshiring

### Xato: CORS error
- ✅ Frontend koddan to'g'ridan-to'g'ri Telegram API ga so'rov yuborish CORS muammosiga olib kelishi mumkin
- ✅ Tavsiya: Database trigger yechimidan foydalaning (COMPLETE_GUIDE.md da tushuntirilgan)

## Database Trigger Yechimi (Tavsiya Etiladi)

Frontend koddan to'g'ridan-to'g'ri Telegram API ga so'rov yuborish CORS muammosiga olib kelishi mumkin. Yaxshiroq yechim - Database trigger ishlatish:

1. `COMPLETE_DATABASE_SETUP.sql` faylini ishga tushiring
2. Bu trigger'lar avtomatik Telegram xabar yuboradi
3. Frontend faqat database'ga ma'lumot saqlaydi
4. CORS muammosi bo'lmaydi

Batafsil ma'lumot: `COMPLETE_GUIDE.md` faylida "TELEGRAM BOT INTEGRATSIYASI" bo'limini ko'ring.


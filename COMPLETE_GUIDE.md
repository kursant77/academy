# A+ Academy - To'liq Qo'llanma 📚

Bu qo'llanma loyihani to'liq sozlash, ishga tushirish va boshqarish uchun barcha kerakli ma'lumotlarni o'z ichiga oladi.

---

# 📋 MUNDARIJA

1. [Loyiha Umumiy Ma'lumot](#loyiha-umumiy-malumot)
2. [Supabase Sozlash](#supabase-sozlash)
3. [Database Setup](#database-setup)
4. [Storage (Rasmlar) Sozlash](#storage-rasmlar-sozlash)
5. [Admin Panel Sozlash](#admin-panel-sozlash)
6. [Telegram Bot Integratsiyasi](#telegram-bot-integratsiyasi)
7. [Development va Test](#development-va-test)
8. [Production Deployment](#production-deployment)
9. [Xavfsizlik](#xavfsizlik)
10. [Design Guidelines](#design-guidelines)
11. [Muammolarni Hal Qilish](#muammolarni-hal-qilish)

---

## 1. LOYIHA UMUMIY MA'LUMOT

### Loyiha Tuzilishi

```
JobConnectFlow/
├── client/              # Frontend React loyihasi
│   ├── src/
│   │   ├── pages/      # Sahifalar
│   │   ├── components/ # Komponentlar
│   │   ├── lib/        # Utility funksiyalar
│   │   └── ...
│   ├── shared/         # Shared types
│   └── ...
└── README.md
```

### Texnologiyalar

- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** Supabase Auth
- **Routing:** Wouter

### Install va Ishga Tushirish

```bash
cd client
npm install
npm run dev
```

Loyiha `http://localhost:5173` da ishga tushadi.

---

## 2. SUPABASE SOZLASH

### 2.1. Supabase Project Yaratish

1. [Supabase](https://supabase.com) ga kiring
2. Yangi project yarating
3. Project Settings → API ga o'ting
4. **Project URL** va **anon key** ni oling

### 2.2. Environment Variables

`client/.env` fayl yarating va quyidagilarni qo'shing:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Telegram Bot Configuration (Ixtiyoriy)
VITE_TELEGRAM_BOT_TOKEN=8578440348:AAHM-FGbW6al3w8wyqSNTWTsCpolhxoJ1ls
VITE_TELEGRAM_CHAT_ID=5865994146
```

### 2.3. Database Setup

1. **Supabase Dashboard → SQL Editor** ga o'ting
2. **`COMPLETE_DATABASE_SETUP.sql`** faylini oching
3. Barcha SQL kodini nusxalab SQL Editor ga yopishtiring
4. **Run** tugmasini bosing

Bu quyidagi jadvallarni yaratadi:
- ✅ `teachers` - O'qituvchilar
- ✅ `courses` - Kurslar
- ✅ `events` - Tadbirlar
- ✅ `categories` - Kategoriyalar
- ✅ `applications` - Ro'yxatdan o'tganlar
- ✅ `achievements` - Yutuqlar
- ✅ `admins` - Adminlar
- ✅ `profiles` - Foydalanuvchi profillari
- ✅ `content_blocks` - Kontent bloklar
- ✅ `site_stats` - Statistikalar
- ✅ `testimonials` - Testimonials
- ✅ `gallery_items` - Galereya
- ✅ `schedule_entries` - Dars jadvali
- ✅ `groups` - Guruhlar
- ✅ `students` - Talabalar
- ✅ `payment_history` - To'lov tarixi
- ✅ `revenue` - Daromad
- ✅ `expenses` - Xarajatlar

---

## 3. DATABASE SETUP

### 3.1. SQL Scriptni Ishga Tushirish

1. Supabase Dashboard → **SQL Editor**
2. **`COMPLETE_DATABASE_SETUP.sql`** faylini oching
3. Barcha kodni nusxalab yopishtiring
4. **Run** tugmasini bosing

### 3.2. Jadval Strukturalari

#### Teachers
```sql
- id (UUID, Primary Key)
- name, specialty, specialty_uz/ru/en
- experience (INTEGER)
- bio, bio_uz/ru/en
- image_url, linked_in, telegram, instagram
- featured (BOOLEAN)
- created_at, updated_at
```

#### Courses
```sql
- id (UUID, Primary Key)
- name, name_uz/ru/en
- description, description_uz/ru/en
- category, duration, price, level
- teacher_id (Foreign Key → teachers)
- schedule
- image_url
- featured (BOOLEAN)
- is_published (BOOLEAN)
- created_at, updated_at
```

#### Applications
```sql
- id (UUID, Primary Key)
- full_name, age, phone
- course_id (Foreign Key → courses)
- interests
- status
- created_at
```

### 3.3. Row Level Security (RLS)

RLS policies avtomatik yaratiladi:
- **Public** o'qishi mumkin: teachers, courses, events, achievements
- **Faqat admin** o'qishi mumkin: applications
- **Public** yozishi mumkin: applications (ro'yxatdan o'tish uchun)
- **Faqat admin** boshqarishi mumkin: barcha jadvallar

---

## 4. STORAGE (RASMLAR) SOZLASH

### 4.1. Storage Bucket Yaratish

**Avtomatik (SQL orqali):**
1. Supabase Dashboard → **SQL Editor**
2. `COMPLETE_DATABASE_SETUP.sql` faylida Storage policies kodi bor
3. SQL kodini ishga tushiring

**Yoki qo'lda:**
1. Supabase Dashboard → **Storage**
2. **New bucket** tugmasini bosing
3. Quyidagilarni kiriting:
   - **Bucket name:** `images` ⚠️ (Faqat shu nom!)
   - **Public bucket:** ✅ (belgilang)
   - **File size limit:** `5242880` (5MB)
   - **Allowed MIME types:** `image/*`
4. **Create bucket** tugmasini bosing

### 4.2. Storage Policies

Policies avtomatik yaratiladi. Agar yo'q bo'lsa:

1. Storage → `images` bucket → **Policies**
2. **New Policy** tugmasini bosing
3. **For full customization** ni tanlang
4. Policy nomi: `Public full access`
5. Allowed operations: `SELECT`, `INSERT`, `UPDATE`, `DELETE`
6. Policy definition: `true`
7. **Save policy**

### 4.3. Fayl Struktura

Rasmlar quyidagi struktura bo'yicha saqlanadi:
```
images/
  ├── teachers/
  │   ├── 1234567890_abc123.jpg
  │   └── ...
  ├── courses/
  │   ├── 1234567891_def456.jpg
  │   └── ...
  ├── events/
  │   └── ...
  └── achievements/
      └── ...
```

---

## 5. ADMIN PANEL SOZLASH

### 5.1. Admin Foydalanuvchi Yaratish

#### Variant 1: Supabase Dashboard orqali (Oson)

1. **Supabase Dashboard → Authentication → Users**
2. **"Add user"** tugmasini bosing
3. Quyidagilarni kiriting:
   ```
   Email: admin@example.com
   Password: Admin123!
   Auto Confirm User: ✅ (belgilang)
   ```
4. **"Create user"** tugmasini bosing
5. **User ID** ni nusxalang (Authentication → Users dan)

#### Variant 2: Admin Jadvaliga Qo'shish

1. **Supabase Dashboard → SQL Editor**
2. Quyidagi SQL kodini ishga tushiring:

```sql
INSERT INTO admins (user_id, email)
VALUES (
  'user_id_bu_yerga',  -- Authentication → Users dan user ID ni nusxalang
  'admin@example.com'   -- Email ni kiriting
);
```

### 5.2. Admin Panelga Kirish

1. Loyihani ishga tushiring: `npm run dev`
2. Browser'da: `http://localhost:5173/admin/login`
3. Email va parolni kiriting
4. **"Kirish"** tugmasini bosing

### 5.3. Admin Panel Bo'limlari

- **Dashboard** - Umumiy statistika va ko'rsatkichlar
- **Kurslar** - Kurslarni boshqarish
- **O'qituvchilar** - O'qituvchilarni boshqarish
- **Guruhlar** - Guruhlarni boshqarish
- **Talabalar** - Talabalarni boshqarish
- **Tadbirlar** - Tadbirlarni boshqarish
- **Ro'yxatdan o'tganlar** - Arizalarni ko'rish
- **Yutuqlar** - Yutuqlarni boshqarish
- **Jadval** - Dars jadvalini boshqarish
- **Moliya** - Daromad va xarajatlar

---

## 6. TELEGRAM BOT INTEGRATSIYASI

### 6.1. Supabase Edge Function Yaratish

#### Qadam 1: Edge Function Yaratish

1. **Supabase Dashboard** ga kiring
2. Chap menuda **"Edge Functions"** ni toping va bosing
3. **"Create a new function"** tugmasini bosing
4. Function nomi: `send-telegram` (katta-kichik harf muhim!)
5. **"Create function"** ni bosing

#### Qadam 2: Function Kodini Qo'shish

Function editor'ga quyidagi kodni yopishtiring:

```typescript
const TELEGRAM_BOT_TOKEN = '8578440348:AAHM-FGbW6al3w8wyqSNTWTsCpolhxoJ1ls';
const TELEGRAM_CHAT_ID = '5865994146';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // CORS preflight request'ni handle qilish
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...CORS_HEADERS
          } 
        }
      );
    }

    // Telegram Bot API ga so'rov yuborish
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.text();
      return new Response(
        JSON.stringify({ error: 'Failed to send message', details: errorData }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...CORS_HEADERS
          } 
        }
      );
    }

    const result = await telegramResponse.json();

    return new Response(
      JSON.stringify({ success: true, result }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...CORS_HEADERS
        } 
      }
    );
  }
});
```

#### Qadam 3: Deploy Qilish

1. **"Deploy"** tugmasini bosing
2. 5-10 soniya kuting
3. ✅ **Tayyor!**

### 6.2. Test Qilish

1. Websaytga o'ting: `http://localhost:5173`
2. `/register` yoki `/contact` sahifasiga o'ting
3. Formani to'ldiring va yuboring
4. Telegram bot'ga xabar kelganini tekshiring!

### 6.3. Xabar Formatlari

#### Registratsiya Formasi
```
🆕 Yangi ro'yxatdan o'tish

👤 Ism: Foydalanuvchi Ismi
📅 Yosh: 25
📱 Telefon: +998901234567
📚 Kurs: Kurs Nomi

⏰ Vaqt: 01.01.2024, 12:00:00
```

#### Aloqa Formasi
```
📧 Yangi xabar (Aloqa)

👤 Ism: Foydalanuvchi Ismi
📮 Email: user@example.com
💬 Xabar:

Xabar matni shu yerda

⏰ Vaqt: 01.01.2024, 12:00:00
```

---

## 7. DEVELOPMENT VA TEST

### 7.1. Loyihani Ishga Tushirish

```bash
cd client
npm install
npm run dev
```

Loyiha `http://localhost:5173` da ishga tushadi.

### 7.2. Admin Panel Test

1. Admin panelga kiring: `http://localhost:5173/admin/login`
2. Email va parol bilan kiring
3. Barcha bo'limlarni tekshiring:
   - Dashboard
   - Teachers
   - Students
   - Groups
   - Courses
   - Events
   - Finance

### 7.3. Frontend Sahifalar Test

- `/` - Bosh sahifa
- `/courses` - Kurslar
- `/teachers` - O'qituvchilar
- `/events` - Tadbirlar
- `/register` - Ro'yxatdan o'tish
- `/contact` - Aloqa

---

## 8. PRODUCTION DEPLOYMENT

### 8.1. Environment Variables

Production ga deploy qilganda environment variables qo'shing:

**Vercel/Netlify/Cloudflare Pages:**
1. Dashboard → Settings → Environment Variables
2. Quyidagilarni qo'shing:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 8.2. Build

```bash
cd client
npm run build
```

Build fayllar `client/dist` papkasida yaratiladi.

### 8.3. RLS Policies Tekshirish

Production'da RLS policies'ni qayta sozlang:
- Public faqat o'qishi mumkin bo'lgan ma'lumotlarni ko'ra oladimi?
- Admin operatsiyalar to'g'ri ishlayaptimi?

---

## 9. XAVFSIZLIK

### 9.1. Maxfiy Ma'lumotlar

⚠️ **MUHIM:** `.env` fayli maxfiy ma'lumotlarni o'z ichiga oladi va **hech qachon Git ga commit qilinmasligi kerak**.

✅ **Qilingan ishlar:**
- `.env` fayl `.gitignore` da
- `.env.example` fayl yaratilgan (namuna sifatida)

### 9.2. Environment Variables

- ✅ `.env` fayl faqat local development uchun
- ✅ Production da environment variables hosting provider orqali sozlanadi
- ⚠️ Hech qachon kod ichida hardcode qilmang

### 9.3. Supabase RLS Policies

Barcha jadvallar uchun RLS yoqilgan:
- ✅ Public o'qishi mumkin: teachers, courses, events, achievements
- ✅ Applications faqat admin ko'ra oladi
- ✅ Barcha yozish operatsiyalari faqat admin uchun

### 9.4. Admin Authentication

- ✅ Admin panelga kirish uchun Supabase Authentication ishlatiladi
- ✅ Parollar hash qilingan holda saqlanadi
- ✅ Session management avtomatik

### 9.5. Service Role Key

⚠️ **Service Role Key ni hech qachon frontend kodiga qo'shmang!**
- Bu key faqat backend server kodida ishlatilishi kerak
- Bu key barcha RLS policies ni bypass qiladi

---

## 10. DESIGN GUIDELINES

### 10.1. Color Palette

**Light Mode:**
- Primary: 210 100% 45% (Professional blue)
- Secondary: 210 20% 25% (Dark blue-gray)
- Accent: 150 60% 45% (Success green)
- Background: 0 0% 98%
- Surface: 0 0% 100%

**Dark Mode:**
- Primary: 210 100% 55%
- Secondary: 210 15% 85%
- Accent: 150 55% 50%
- Background: 220 15% 10%
- Surface: 220 15% 15%

### 10.2. Typography

**Font Families:**
- Primary: Inter (headings, UI elements)
- Secondary: Open Sans (body text)

**Scale:**
- Display: text-5xl md:text-6xl lg:text-7xl
- H1: text-4xl md:text-5xl
- H2: text-3xl md:text-4xl
- H3: text-2xl md:text-3xl
- Body: text-base
- Small: text-sm

### 10.3. Layout System

**Spacing:**
- Micro: p-2, gap-2
- Component: p-4, p-6
- Section: py-12 md:py-16

**Grid Systems:**
- Course cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Teacher profiles: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Stats: grid-cols-2 md:grid-cols-4

### 10.4. Responsive Breakpoints

- **Mobile:** < 768px (single column)
- **Tablet:** 768px - 1024px (2-col layouts)
- **Desktop:** > 1024px (full multi-column)

---

## 11. MUAMMOLARNI HAL QILISH

### 11.1. Database Muammolari

#### Jadvallar yaratilmayapti
1. SQL Editor da xatoliklarni tekshiring
2. Har bir CREATE TABLE ni alohida ishga tushiring
3. Supabase Dashboard → Table Editor da jadvallar yaratilganini tekshiring

#### RLS xatolik bersa
1. Policies ni alohida yarating
2. Supabase Dashboard → Authentication → Policies da tekshiring

### 11.2. Storage Muammolari

#### Rasm yuklanmayapti
- Storage bucket yaratilganini tekshiring (nom: `images`)
- Bucket **Public** ekanligini tekshiring
- Policies to'g'ri sozlanganini tekshiring
- Browser console'da xatoliklarni ko'ring

#### Rasm ko'rinmayapti
- Public bucket sozlamasini tekshiring
- Rasm URL'ini to'g'ri olinayotganini tekshiring
- CORS sozlamalarini tekshiring

### 11.3. Admin Panel Muammolari

#### "Email yoki parol noto'g'ri"
1. Supabase Dashboard → Authentication → Users da foydalanuvchi yaratilganini tekshiring
2. Email va parol to'g'ri ekanligini tekshiring
3. "Auto Confirm User" belgilanganligini tekshiring

#### "Admin emas" xatosi
1. `admins` jadvalida foydalanuvchi borligini tekshiring:
   ```sql
   SELECT * FROM admins;
   ```
2. Agar yo'q bo'lsa, qo'shing:
   ```sql
   INSERT INTO admins (user_id, email)
   VALUES ('user_id', 'email');
   ```

### 11.4. Telegram Bot Muammolari

#### Function topilmayapti
1. Function nomi to'g'ri ekanligini tekshiring: `send-telegram`
2. Deploy qilinganini tekshiring (Edge Functions → Functions → send-telegram)

#### Xabar kelmayapti
1. Browser Console'ni oching (F12)
2. Network tab'ida `send-telegram` function'ga so'rov ketayotganini ko'ring
3. Edge Functions → Functions → send-telegram → Logs'da xatoliklarni ko'ring

#### CORS xatolik
1. Edge Function kodida CORS headers borligini tekshiring
2. Function'ni qayta deploy qiling

### 11.5. Browser Cache Muammolari

#### Eski kod ishlayapti
1. **Hard Refresh:** `Ctrl + Shift + R` yoki `Ctrl + F5`
2. Browser cache'ni tozalang: `Ctrl + Shift + Delete`
3. Development server'ni qayta ishga tushiring
4. Browser'ni to'liq yoping va qayta oching

---

## 12. ADMIN PANEL RESPONSIVLIGI

### 12.1. Mobil Optimallashtirish

Barcha admin sahifalar mobil uchun optimallashtirilgan:

- ✅ **AdminLayout** - Responsive sidebar va header
- ✅ **Dashboard** - Responsive kartalar va grafiklar
- ✅ **Courses** - Responsive jadval va formlar
- ✅ **Students** - Responsive jadval va filterlar
- ✅ **Teachers** - Responsive kartalar
- ✅ **Groups** - Responsive jadval
- ✅ **Applications** - Responsive jadval

### 12.2. Responsive Breakpoints

- `sm:` - 640px dan boshlab
- `md:` - 768px dan boshlab
- `lg:` - 1024px dan boshlab
- `xl:` - 1280px dan boshlab

### 12.3. Mobil Optimallashtirilgan Elementlar

- **Jadvallar** - Gorizontal scroll yoki kartalar ko'rinishida
- **Formalar** - 1 kolonka (mobil) → 2 kolonka (desktop)
- **Kartalar** - Responsive grid layout
- **Dialog'lar** - To'liq ekran (mobil) → Markazda (desktop)
- **Text o'lchamlari** - Responsive shriftlar

---

## 13. FOYDALI LINKLAR

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Supabase Docs:** https://supabase.com/docs
- **Telegram Bot API:** https://core.telegram.org/bots/api
- **Tailwind CSS:** https://tailwindcss.com
- **shadcn/ui:** https://ui.shadcn.com

---

## 14. FAQ (TEZ-TEZ SO'RALADIGAN SAVOLLAR)

### Q: Database jadvallar yaratilmayapti?

**A:** `COMPLETE_DATABASE_SETUP.sql` faylini Supabase SQL Editor'da to'liq ishga tushiring. Har bir CREATE TABLE alohida ishga tushsa ham bo'ladi.

### Q: Admin panelga kira olmayman?

**A:** 
1. Authentication → Users da foydalanuvchi yaratilganini tekshiring
2. `admins` jadvalida user_id borligini tekshiring
3. Parol to'g'ri ekanligini tekshiring

### Q: Rasmlar yuklanmayapti?

**A:**
1. Storage → `images` bucket yaratilganini tekshiring
2. Bucket Public ekanligini tekshiring
3. Storage policies to'g'ri sozlanganini tekshiring

### Q: Telegram bot'ga xabar kelmayapti?

**A:**
1. Edge Function yaratilganini tekshiring (`send-telegram`)
2. Function deploy qilinganini tekshiring
3. Browser Console'da xatoliklarni tekshiring
4. Edge Functions → Logs'da xatoliklarni ko'ring

### Q: Production'ga qanday deploy qilaman?

**A:**
1. Environment variables qo'shing (Vercel/Netlify/Cloudflare Pages)
2. `npm run build` ni ishga tushiring
3. `dist` papkasini deploy qiling
4. RLS policies'ni production uchun sozlang

---

## 15. SUPPORT

Agar muammo bo'lsa:

1. Browser Console'ni tekshiring (F12)
2. Supabase Dashboard → Logs'da xatoliklarni ko'ring
3. SQL Editor → Logs'da xatoliklarni ko'ring
4. Edge Functions → Logs'da xatoliklarni ko'ring

---

**Oxirgi yangilanish:** 2024

**Versiya:** 1.0.0

---

## ✅ Tekshirish Ro'yxati

### Dastlabki Sozlash
- [ ] Supabase Project yaratildi
- [ ] Environment variables sozlandi
- [ ] Database jadvallar yaratildi
- [ ] Storage bucket yaratildi
- [ ] Admin foydalanuvchi yaratildi

### Telegram Integratsiya
- [ ] Edge Function yaratildi
- [ ] Function deploy qilindi
- [ ] Registratsiya formasi test qilindi
- [ ] Aloqa formasi test qilindi

### Test
- [ ] Admin panelga kirish test qilindi
- [ ] Barcha admin sahifalar test qilindi
- [ ] Frontend sahifalar test qilindi
- [ ] Responsive design test qilindi

---

**🎉 Tayyor! Barcha qo'llanmalar bitta faylda!**

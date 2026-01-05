# IELTS Imperia - To'liq Qo'llanma 📚

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
12. [SEO Optimizatsiyasi](#seo-optimizatsiyasi)
13. [Bundle Size Optimizatsiyasi](#bundle-size-optimizatsiyasi)
14. [Deployment Checklist](#deployment-checklist)

---

## 1. LOYIHA UMUMIY MA'LUMOT

### Loyiha Tuzilishi

```
ACADEMY/
├── src/              # Frontend React loyihasi
│   ├── pages/      # Sahifalar
│   ├── components/ # Komponentlar
│   ├── lib/        # Utility funksiyalar
│   └── ...
├── public/          # Static fayllar
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

`.env` fayl yarating va quyidagilarni qo'shing:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Telegram Bot Configuration (Ixtiyoriy)
VITE_TELEGRAM_BOT_TOKEN=your_bot_token
VITE_TELEGRAM_CHAT_ID=your_chat_id
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

### 6.1. Database Trigger Yechimi (Tavsiya Etiladi)

Bu yechim **database trigger** ishlatadi va **CORS muammosi umuman bo'lmaydi**, chunki trigger server-side'da ishlaydi.

#### Qadam 1: SQL Skriptni Ishga Tushirish

1. **Supabase Dashboard** ga kiring
2. **SQL Editor** ga o'ting
3. **`COMPLETE_DATABASE_SETUP.sql`** faylida Telegram trigger kodi bor
4. Barcha SQL kodini nusxalab SQL Editor'ga yopishtiring
5. **Run** tugmasini bosing

#### Qadam 2: Nima Qiladi?

SQL skript quyidagilarni yaratadi:

1. ✅ **pg_net extension** - HTTP so'rovlar yuborish uchun
2. ✅ **send_telegram_message function** - Telegram API ga xabar yuboradi
3. ✅ **notify_new_application function** - Registratsiya uchun trigger
4. ✅ **notify_new_contact_message function** - Aloqa formasi uchun trigger
5. ✅ **contact_messages jadvali** - Agar mavjud bo'lmasa yaratadi
6. ✅ **Trigger'lar** - Avtomatik Telegram xabar yuboradi

#### Qadam 3: Frontend Kod

Frontend kod **o'zgartirildi**:
- ✅ `register.tsx` - Faqat database'ga saqlaydi, trigger avtomatik xabar yuboradi
- ✅ `contact.tsx` - Faqat database'ga saqlaydi, trigger avtomatik xabar yuboradi
- ✅ Edge Function chaqiruvlari olib tashlandi

### 6.2. Test Qilish

#### 1. Test Funksiyasini Ishlatish

SQL Editor'da:

```sql
SELECT test_telegram_message('Salom, bu test xabar!');
```

Agar `true` qaytsa, function to'g'ri ishlayapti!

#### 2. Websaytda Test

1. Websaytga o'ting: `http://localhost:5173`
2. `/register` formasini to'ldiring va yuboring
3. Telegram bot'ga xabar kelganini tekshiring!

Yoki:

1. `/contact` formasini to'ldiring va yuboring
2. Telegram bot'ga xabar kelganini tekshiring!

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

### 6.4. Afzalliklari

- ✅ **CORS muammosi yo'q** - Server-side'da ishlaydi
- ✅ **Edge Function kerak emas** - Faqat database trigger
- ✅ **Avtomatik ishlaydi** - Yangi yozuv qo'shilganda xabar ketadi
- ✅ **Xavfsiz** - Server-side'da ishlaydi, token xavfsiz
- ✅ **Oson** - Bitta SQL skript bajariladi

---

## 7. DEVELOPMENT VA TEST

### 7.1. Loyihani Ishga Tushirish

```bash
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
   VITE_SITE_URL=https://ieltsimperia.uz
   ```

### 8.2. Build

```bash
npm run build
```

Build fayllar `dist` papkasida yaratiladi.

### 8.3. Vercel Deployment

#### Environment Variables

Vercel dashboard'da quyidagi environment variables'ni sozlash kerak:

1. **Project Settings > Environment Variables** ga kiring
2. Quyidagi variables'ni qo'shing:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci... (Supabase dashboard'dan oling)
VITE_SITE_URL=https://ieltsimperia.uz
```

3. Har bir variable uchun **Production, Preview, Development** ni tanlang
4. Save qiling va project'ni qayta deploy qiling

#### Supabase Credentials Qayerdan Olinadi:

1. Supabase dashboard: https://app.supabase.com
2. Project'ni tanlang
3. **Settings > API**
4. `Project URL` → `VITE_SUPABASE_URL`
5. `anon public` key → `VITE_SUPABASE_ANON_KEY`

#### Deploy Qilish:

```bash
# Vercel CLI orqali
npm i -g vercel
vercel --prod

# Yoki GitHub orqali
# 1. GitHub'ga push qiling
# 2. Vercel dashboard'da project'ni import qiling
# 3. Environment variables'ni sozlang
# 4. Deploy qiling
```

### 8.4. Netlify Deployment

#### Variant A: Netlify CLI orqali

```bash
# Netlify CLI o'rnatish
npm i -g netlify-cli

# Login qilish
netlify login

# Deploy qilish
netlify deploy --prod
```

#### Variant B: Drag & Drop

1. `npm run build` ni ishga tushiring
2. https://app.netlify.com ga kiring
3. "Add new site" > "Deploy manually"
4. `dist/` papkasini drag & drop qiling
5. Environment Variables qo'shing (Site settings > Environment variables)

### 8.5. Custom Server (Nginx/Apache)

#### Build qilish:
```bash
npm run build
```

#### Server'ga yuklash:
```bash
# SCP orqali
scp -r dist/* user@your-server.com:/var/www/ieltsimperia/

# Yoki FTP/SFTP orqali
# dist/ papkasidagi barcha fayllarni server'ga yuklang
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name ieltsimperia.uz www.ieltsimperia.uz;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ieltsimperia.uz www.ieltsimperia.uz;
    
    # SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/ieltsimperia/dist;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Block admin routes from indexing
    location /admin {
        add_header X-Robots-Tag "noindex, nofollow";
        try_files $uri $uri/ /index.html;
    }
    
    # robots.txt va sitemap.xml
    location ~ ^/(robots\.txt|sitemap\.xml)$ {
        access_log off;
    }
}
```

#### Apache Configuration (.htaccess)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

### 8.6. RLS Policies Tekshirish

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

#### Trigger ishlamayapti
1. pg_net extension yoqilganini tekshiring:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_net;
   ```
2. Trigger'lar mavjudligini tekshiring:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%telegram%';
   ```
3. Function'lar mavjudligini tekshiring:
   ```sql
   SELECT * FROM pg_proc WHERE proname LIKE '%telegram%';
   ```

#### Xabar kelmayapti
1. Browser Console'ni oching (F12)
2. Network tab'ida database so'rovlarini ko'ring
3. Supabase Dashboard → Logs → Postgres Logs'da xatoliklarni ko'ring

### 11.5. Browser Cache Muammolari

#### Eski kod ishlayapti
1. **Hard Refresh:** `Ctrl + Shift + R` yoki `Ctrl + F5`
2. Browser cache'ni tozalang: `Ctrl + Shift + Delete`
3. Development server'ni qayta ishga tushiring
4. Browser'ni to'liq yoping va qayta oching

---

## 12. SEO OPTIMIZATSIYASI

### 12.1. Qilingan Optimizatsiyalar

#### SEO Komponenti Yaratildi
- **`src/components/SEO.tsx`** - Dinamik SEO komponenti
- Meta teglar, Open Graph, Twitter Card
- Strukturangan ma'lumotlar (JSON-LD)
- Canonical URL

#### index.html Yangilandi
- Open Graph meta teglar
- Twitter Card meta teglar
- Strukturangan ma'lumotlar (Schema.org)
- Favicon va Apple Touch Icon

#### Sahifalarga SEO Qo'shildi
- ✅ Home (`/`) - To'liq SEO + strukturangan ma'lumotlar
- ✅ Courses (`/courses`) - Kurslar ro'yxati SEO
- ✅ Teachers (`/teachers`) - O'qituvchilar SEO
- ✅ Events (`/events`) - Tadbirlar SEO
- ✅ About (`/about`) - Biz haqimizda SEO
- ✅ Contact (`/contact`) - Aloqa SEO
- ✅ Register (`/register`) - Ro'yxatdan o'tish SEO
- ✅ Achievements (`/achievements`) - Yutuqlar SEO

### 12.2. Asosiy SEO Elementlari

#### Meta Teglar
```html
- title
- description
- keywords
- author
- robots
```

#### Open Graph
```html
- og:title
- og:description
- og:image
- og:url
- og:type
- og:site_name
```

#### Twitter Card
```html
- twitter:card
- twitter:title
- twitter:description
- twitter:image
```

#### Strukturangan Ma'lumotlar (JSON-LD)
- EducationalOrganization schema
- Course schema
- ItemList schema
- BreadcrumbList schema
- FAQPage schema

### 12.3. Qanday Qo'shish

Har bir sahifaga SEO qo'shish uchun:

```tsx
import { SEO } from "@/components/SEO";

export default function MyPage() {
  return (
    <>
      <SEO 
        title="Sahifa Nomi — IELTS Imperia"
        description="Sahifa tavsifi..."
        keywords="kalit sozlar..."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          // ...
        }}
      />
      {/* Sahifa kontenti */}
    </>
  );
}
```

### 12.4. SEO Best Practices

1. **Title** - 50-60 belgi, har bir sahifa uchun unikal
2. **Description** - 150-160 belgi, qiziqarli va tavsiflovchi
3. **Keywords** - 10-15 muhim kalit soz
4. **Image** - 1200x630px (Open Graph uchun)
5. **Structured Data** - Har bir sahifa turi uchun mos schema

### 12.5. Google Search Console

1. Google Search Console ga kiring
2. Loyihani qo'shing
3. Sitemap yuklang: `https://ieltsimperia.uz/sitemap.xml`
4. Indexlash tezligini kuzating

### 12.6. Test Qilish

1. **Google Rich Results Test:**
   - https://search.google.com/test/rich-results
   - URL ni kiriting va strukturangan ma'lumotlarni tekshiring

2. **Facebook Sharing Debugger:**
   - https://developers.facebook.com/tools/debug/
   - Open Graph teglarni tekshiring

3. **Twitter Card Validator:**
   - https://cards-dev.twitter.com/validator
   - Twitter Card teglarni tekshiring

---

## 13. BUNDLE SIZE OPTIMIZATSIYASI

### 13.1. Qilingan Optimizatsiyalar

#### Code Splitting ✅
- **React va React-DOM** - Main bundle'da (critical, split qilinmaydi)
- **Radix UI** - Alohida chunk'larga ajratilgan (har bir komponent alohida)
- **Recharts** - Faqat admin dashboard'da, lazy load orqali
- **Framer Motion** - Alohida chunk
- **Icons** - Lucide va React Icons alohida chunk'lar
- **Utils** - Kichik utility library'lar bitta chunk'da

#### Minification ✅
- **Terser** - Agressiv minification (2 passes)
- **Console.log'lar o'chirilgan** - Production'da
- **Comments o'chirilgan** - Barcha comment'lar
- **Unsafe optimizations** - Agressiv compression

#### Tree Shaking ✅
- **ES Modules** - Avtomatik tree shaking
- **Unused code** - Avtomatik o'chiriladi
- **CSS code splitting** - Faqat ishlatilgan CSS

#### Lazy Loading ✅
- **Barcha sahifalar** - Lazy load qilingan
- **Admin sahifalar** - Alohida lazy load
- **Recharts** - Faqat admin dashboard'da, lazy load

#### Asset Optimization ✅
- **4KB dan kichik fayllar** - Inline qilinadi
- **Image optimization** - Lazy loading
- **Font optimization** - Display swap

### 13.2. Expected Bundle Sizes

#### Main Bundle (Initial Load)
- **Size**: ~150-200KB (gzipped)
- **Ichimida**: React, React-DOM, Router, Core utilities

#### Vendor Chunks
- **UI (Radix)**: ~100-150KB (gzipped)
- **Supabase**: ~50-80KB (gzipped)
- **Icons**: ~30-50KB (gzipped)
- **Utils**: ~20-30KB (gzipped)
- **Router**: ~10-20KB (gzipped)

#### Admin Chunks (Lazy Loaded)
- **Dashboard + Recharts**: ~200-300KB (gzipped)
- **Admin Components**: ~50-100KB (gzipped)

#### Total Initial Load
- **Without Admin**: ~400-600KB (gzipped)
- **With Admin**: ~700-1000KB (gzipped)

### 13.3. Performance Metrics

#### Target Metrics:
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3s
- **Total Blocking Time (TBT)**: < 300ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### 13.4. Bundle Size'ni Tekshirish

```bash
# Build qilish
npm run build

# Bundle size'ni ko'rish
ls -lh dist/assets/
```

---

## 14. DEPLOYMENT CHECKLIST

### Pre-Deployment Checklist

#### 1. Environment Variables ✅
- [ ] `.env` fayl yaratilgan va to'ldirilgan
- [ ] `VITE_SUPABASE_URL` to'g'ri
- [ ] `VITE_SUPABASE_ANON_KEY` to'g'ri
- [ ] `VITE_SITE_URL` production URL'ga o'rnatilgan
- [ ] `.env` fayl `.gitignore` da (hech qachon commit qilinmasin!)

#### 2. Build Test ✅
```bash
npm install
npm run build
npm run preview
```
- [ ] Build muvaffaqiyatli yakunlandi
- [ ] Preview'da barcha sahifalar ishlayapti
- [ ] Console'da xatoliklar yo'q
- [ ] Supabase ulanishi ishlayapti

#### 3. Code Quality ✅
- [ ] TypeScript xatoliklari yo'q (`npm run type-check`)
- [ ] ESLint xatoliklari yo'q (`npm run lint`)
- [ ] Barcha import'lar to'g'ri
- [ ] Unused code o'chirilgan

#### 4. SEO Optimization ✅
- [ ] `public/sitemap.xml` yangilangan
- [ ] `public/robots.txt` to'g'ri
- [ ] Barcha sahifalarda SEO komponenti ishlatilgan
- [ ] Meta taglar to'g'ri
- [ ] Open Graph image mavjud (`/og-image.jpg`)

#### 5. Database Setup ✅
- [ ] Supabase'da barcha jadvallar yaratilgan
- [ ] RLS policies sozlangan
- [ ] Test ma'lumotlar o'chirilgan (production uchun)
- [ ] Admin foydalanuvchi yaratilgan

#### 6. Assets ✅
- [ ] Barcha image'lar optimallashtirilgan
- [ ] Favicon va logo mavjud
- [ ] OG image mavjud (1200x630px)
- [ ] Apple touch icon mavjud

#### 7. Security ✅
- [ ] Admin route'lar `noindex` (robots.txt)
- [ ] Environment variables xavfsiz
- [ ] API key'lar public bo'lmagan
- [ ] CORS sozlamalari to'g'ri

### Post-Deployment Checklist

#### 1. Functionality Test ✅
- [ ] Home page yuklanmoqda
- [ ] Barcha sahifalar ishlayapti
- [ ] Navigation ishlayapti
- [ ] Forms ishlayapti
- [ ] Admin panel ishlayapti
- [ ] Supabase ulanishi ishlayapti

#### 2. SEO Verification ✅
- [ ] Google Search Console'ga qo'shildi
- [ ] Sitemap yuklandi
- [ ] robots.txt tekshirildi
- [ ] Meta taglar to'g'ri (Facebook Debugger)
- [ ] Twitter Card to'g'ri (Twitter Card Validator)

#### 3. Performance Test ✅
- [ ] Google PageSpeed Insights (90+ score)
- [ ] GTmetrix (A+ rating)
- [ ] WebPageTest
- [ ] Lighthouse audit

#### 4. Security Test ✅
- [ ] SSL sertifikat ishlayapti
- [ ] Security headers to'g'ri (SecurityHeaders.com)
- [ ] XSS protection ishlayapti
- [ ] CSRF protection ishlayapti

---

## 15. FAQ (TEZ-TEZ SO'RALADIGAN SAVOLLAR)

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
1. Database trigger'lar yaratilganini tekshiring
2. pg_net extension yoqilganini tekshiring
3. Browser Console'da xatoliklarni tekshiring
4. Supabase Dashboard → Logs → Postgres Logs'da xatoliklarni ko'ring

### Q: Production'ga qanday deploy qilaman?

**A:**
1. Environment variables qo'shing (Vercel/Netlify/Cloudflare Pages)
2. `npm run build` ni ishga tushiring
3. `dist` papkasini deploy qiling
4. RLS policies'ni production uchun sozlang

---

## 16. SUPPORT

Agar muammo bo'lsa:

1. Browser Console'ni tekshiring (F12)
2. Supabase Dashboard → Logs'da xatoliklarni ko'ring
3. SQL Editor → Logs'da xatoliklarni ko'ring
4. Network tab'da API so'rovlarni tekshiring

---

**Oxirgi yangilanish:** 2025-01-28

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
- [ ] Database trigger'lar yaratildi
- [ ] pg_net extension yoqildi
- [ ] Registratsiya formasi test qilindi
- [ ] Aloqa formasi test qilindi

### Test
- [ ] Admin panelga kirish test qilindi
- [ ] Barcha admin sahifalar test qilindi
- [ ] Frontend sahifalar test qilindi
- [ ] Responsive design test qilindi

---

**🎉 Tayyor! Barcha qo'llanmalar bitta faylda!**

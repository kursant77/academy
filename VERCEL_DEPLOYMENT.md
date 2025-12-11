# 🚀 Vercel Deployment Guide

## ✅ Tayyorlangan Sozlamalar

Loyiha Vercel'ga deploy qilish uchun to'liq tayyorlandi.

### 1. Vercel.json Sozlamalari

`vercel.json` fayli quyidagilarni o'z ichiga oladi:
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ Framework: `vite`
- ✅ Routing rewrites (SPA uchun)
- ✅ Security headers

### 2. Environment Variables

Vercel dashboard'da quyidagi environment variables'ni sozlash **majburiy**:

#### Majburiy Variables:

1. **VITE_SUPABASE_URL**
   - Value: Supabase project URL (masalan: `https://xxxxx.supabase.co`)
   - Environment: Production, Preview, Development

2. **VITE_SUPABASE_ANON_KEY**
   - Value: Supabase anonymous public key
   - Environment: Production, Preview, Development

#### Ixtiyoriy Variables:

3. **VITE_TELEGRAM_BOT_TOKEN** (Telegram bildirishnomalar uchun)
   - Value: Telegram bot token
   - Environment: Production, Preview

4. **VITE_TELEGRAM_CHAT_ID** (Telegram bildirishnomalar uchun)
   - Value: Telegram chat ID
   - Environment: Production, Preview

5. **VITE_SITE_URL** (SEO uchun)
   - Value: Production site URL (masalan: `https://aplusacademy.uz`)
   - Environment: Production

6. **VITE_GA_MEASUREMENT_ID** (Google Analytics uchun - ixtiyoriy)
   - Value: Google Analytics Measurement ID
   - Environment: Production

7. **VITE_YANDEX_METRICA_ID** (Yandex Metrica uchun - ixtiyoriy)
   - Value: Yandex Metrica ID
   - Environment: Production

### 3. Environment Variables Qayerdan Olinadi?

#### Supabase Credentials:

1. Supabase dashboard'ga kiring: https://app.supabase.com
2. Project'ni tanlang
3. **Settings > API** ga o'ting
4. `Project URL` → `VITE_SUPABASE_URL`
5. `anon public` key → `VITE_SUPABASE_ANON_KEY`

#### Telegram Bot:

1. @BotFather ga o'ting va bot yarating
2. Bot token → `VITE_TELEGRAM_BOT_TOKEN`
3. Chat ID ni olish uchun @userinfobot ga yuboring
4. Chat ID → `VITE_TELEGRAM_CHAT_ID`

### 4. Vercel'ga Deploy Qilish

#### Birinchi Deploy:

1. GitHub repository'ni Vercel'ga ulang
2. Project Settings > Environment Variables ga kiring
3. Yuqoridagi environment variables'larni qo'shing
4. **Root Directory** ni `client` ga o'rnating (agar client papka ichida bo'lsa)
5. **Build Command**: `npm run build` (avtomatik)
6. **Output Directory**: `dist` (avtomatik)
7. **Install Command**: `npm install` (avtomatik)
8. Deploy qiling

#### Qayta Deploy:

Agar environment variables o'zgarsa:
1. Settings > Environment Variables da yangilang
2. Project > Deployments > Redeploy

### 5. Build Sozlamalari

- ✅ Framework: Vite
- ✅ Node.js Version: 18.x yoki yuqori (Vercel avtomatik tanlaydi)
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`

### 6. Routing

SPA routing to'g'ri sozlangan:
- ✅ Barcha routelar `/index.html` ga yo'naltiriladi
- ✅ Static fayllar to'g'ri serve qilinadi
- ✅ SEO fayllar (robots.txt, sitemap.xml) ishlaydi

### 7. Tekshirish

Deploy qilgandan keyin:

1. ✅ Build muvaffaqiyatli yakunlandimi?
2. ✅ Environment variables to'g'ri sozlanganmi?
3. ✅ Barcha sahifalar ishlayaptimi?
4. ✅ Supabase ulanishi ishlayaptimi?
5. ✅ Admin panel ishlayaptimi?

### 8. Xatoliklarni Tuzatish

#### Build Xatoliklari:

- TypeScript xatoliklari: `npm run type-check`
- Build xatoliklari: `npm run build` (local'da test qiling)

#### Runtime Xatoliklari:

- Browser console'da xatoliklarni tekshiring
- Network tab'da API so'rovlarni tekshiring
- Environment variables to'g'ri sozlanganini tekshiring

#### Supabase Ulanish Xatoliklari:

- Environment variables to'g'ri ekanligini tekshiring
- Supabase RLS policies'ni tekshiring
- CORS sozlamalarini tekshiring

### 9. Optimizatsiya

Loyiha quyidagi optimizatsiyalar bilan tayyorlandi:

- ✅ Code splitting (vendor chunks)
- ✅ Tree shaking
- ✅ Minification
- ✅ CSS code splitting
- ✅ Asset optimization
- ✅ Sourcemap o'chirilgan (production)
- ✅ Console.log'lar tozalanadi

### 10. Security

- ✅ Security headers sozlangan
- ✅ Environment variables xavfsiz
- ✅ Supabase RLS policies faollashtirilgan
- ✅ Error boundary mavjud

## 📝 Checklist

Deploy qilishdan oldin:

- [ ] Environment variables qo'shildi (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- [ ] Local build test qilindi (`npm run build`)
- [ ] TypeScript xatoliklari yo'q (`npm run type-check`)
- [ ] Linter xatoliklari yo'q (`npm run lint`)
- [ ] Root Directory to'g'ri sozlangan (`client` yoki `.`)

## 🎉 Tayyor!

Loyiha Vercel'ga deploy qilish uchun to'liq tayyor. Faqat environment variables'ni sozlang va deploy qiling!


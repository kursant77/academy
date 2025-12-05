# 🚀 Deployment Guide - A+ Academy

## Production Build

### 1. Environment Variables

`.env` faylini yarating va quyidagi o'zgaruvchilarni to'ldiring:

```bash
cp .env.example .env
```

**Majburiy o'zgaruvchilar:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_SITE_URL` - Production site URL (masalan: https://aplusacademy.uz)

### 2. Build

```bash
npm install
npm run build
```

Build natijasi `dist/` papkasida yaratiladi.

### 3. Build Optimizatsiyasi

- ✅ Code splitting (vendor chunks)
- ✅ Tree shaking
- ✅ Minification (Terser)
- ✅ Console.log larni o'chirish
- ✅ Sourcemap o'chirilgan (production)
- ✅ CSS code splitting
- ✅ Asset optimization

### 4. SEO Optimizatsiyasi

**Qilingan optimizatsiyalar:**
- ✅ Meta tags (title, description, keywords)
- ✅ Open Graph tags
- ✅ Twitter Card tags
- ✅ Structured Data (JSON-LD)
- ✅ Canonical URLs
- ✅ robots.txt
- ✅ sitemap.xml
- ✅ Language tags
- ✅ Mobile-friendly meta viewport

**Sitemap yangilash:**
Har safar yangi kontent qo'shganda `public/sitemap.xml` ni yangilang.

### 5. Server Configuration

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name aplusacademy.uz www.aplusacademy.uz;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aplusacademy.uz www.aplusacademy.uz;
    
    # SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/aplusacademy/dist;
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
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
    
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
  ExpiresByType application/x-font-ttf "access plus 1 year"
  ExpiresByType application/x-font-woff "access plus 1 year"
  ExpiresByType application/x-font-woff2 "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-Content-Type-Options "nosniff"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

### 6. Performance Optimizatsiyasi

**Qilingan optimizatsiyalar:**
- ✅ Code splitting (vendor chunks)
- ✅ Lazy loading
- ✅ Image optimization
- ✅ Font optimization
- ✅ CSS minification
- ✅ JavaScript minification
- ✅ Tree shaking

**Qo'shimcha tavsiyalar:**
- CDN ishlatish (Cloudflare, AWS CloudFront)
- Image CDN (Cloudinary, Imgix)
- Service Worker (PWA)

### 7. Monitoring va Analytics

**Google Analytics:**
`.env` faylida `VITE_GA_MEASUREMENT_ID` ni qo'shing.

**Error Tracking:**
- Sentry
- LogRocket
- Bugsnag

### 8. Database Setup

Supabase'da quyidagi SQL fayllarni ishga tushiring:

1. `COMPLETE_DATABASE_SETUP.sql` - Asosiy jadvallar
2. `STUDENT_PAYMENT_SYSTEM.sql` - To'lov tizimi
3. `SYSTEM_OPTIONS_SETUP.sql` - Sozlamalar
4. `SUPABASE_TELEGRAM_TRIGGER.sql` - Telegram integratsiyasi

### 9. Pre-deployment Checklist

- [ ] `.env` fayl to'ldirilgan
- [ ] `VITE_SITE_URL` to'g'ri
- [ ] Supabase RLS policies sozlangan
- [ ] Database migrations ishga tushirilgan
- [ ] `sitemap.xml` yangilangan
- [ ] `robots.txt` tekshirilgan
- [ ] SSL sertifikat o'rnatilgan
- [ ] Error tracking sozlangan
- [ ] Analytics sozlangan
- [ ] Build test qilingan (`npm run build && npm run preview`)

### 10. Post-deployment

1. **SEO tekshirish:**
   - Google Search Console ga qo'shing
   - Sitemap yuklang
   - robots.txt tekshiring

2. **Performance tekshirish:**
   - Google PageSpeed Insights
   - GTmetrix
   - WebPageTest

3. **Security tekshirish:**
   - SSL Labs
   - Security Headers

### 11. CI/CD (Optional)

GitHub Actions yoki GitLab CI/CD orqali avtomatik deploy qilish mumkin.

---

## Support

Muammo bo'lsa, GitHub Issues yoki email orqali bog'laning.


# SEO Optimallashtirish - To'liq Qo'llanma

## ✅ Qilingan Ishlar

### 1. SEO Komponenti Yaratildi
- **`client/src/components/SEO.tsx`** - Dinamik SEO komponenti
- Meta teglar, Open Graph, Twitter Card
- Strukturangan ma'lumotlar (JSON-LD)
- Canonical URL

### 2. index.html Yangilandi
- Open Graph meta teglar
- Twitter Card meta teglar
- Strukturangan ma'lumotlar (Schema.org)
- Favicon va Apple Touch Icon

### 3. Sahifalarga SEO Qo'shildi
- ✅ Home (`/`) - To'liq SEO + strukturangan ma'lumotlar
- ✅ Courses (`/courses`) - Kurslar ro'yxati SEO

### 4. Asosiy SEO Elementlari

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

## 📋 Keyingi Qadamlar

### Qo'shish kerak bo'lgan sahifalar:
- [ ] Teachers (`/teachers`)
- [ ] Register (`/register`)
- [ ] Contact (`/contact`)
- [ ] Events (`/events`)
- [ ] About (`/about`)
- [ ] Individual Course pages
- [ ] Individual Teacher pages

## 🔧 Qanday Qo'shish

Har bir sahifaga SEO qo'shish uchun:

```tsx
import { SEO } from "@/components/SEO";

export default function MyPage() {
  return (
    <>
      <SEO 
        title="Sahifa Nomi — A+ Academy"
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

## 🎯 SEO Best Practices

1. **Title** - 50-60 belgi, har bir sahifa uchun unikal
2. **Description** - 150-160 belgi, qiziqarli va tavsiflovchi
3. **Keywords** - 10-15 muhim kalit soz
4. **Image** - 1200x630px (Open Graph uchun)
5. **Structured Data** - Har bir sahifa turi uchun mos schema

## 📊 Google Search Console

1. Google Search Console ga kiring
2. Loyihani qo'shing
3. Sitemap yuklang (keyinchalik yaratiladi)
4. Indexlash tezligini kuzating

## ✅ Test Qilish

1. **Google Rich Results Test:**
   - https://search.google.com/test/rich-results
   - URL ni kiriting va strukturangan ma'lumotlarni tekshiring

2. **Facebook Sharing Debugger:**
   - https://developers.facebook.com/tools/debug/
   - Open Graph teglarni tekshiring

3. **Twitter Card Validator:**
   - https://cards-dev.twitter.com/validator
   - Twitter Card teglarni tekshiring

## 🚀 Production

Production'ga deploy qilganda:
1. `og-image.jpg` rasmini qo'shing (1200x630px)
2. `favicon.ico` va `apple-touch-icon.png` qo'shing
3. Sitemap yarating va Google Search Console ga yuklang
4. robots.txt yarating

---

**SEO optimallashtirish to'liq sozlandi!** 🎉

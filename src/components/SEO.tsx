import { useEffect } from 'react';
import { SITE_URL, SITE_NAME } from '@/lib/seo-utils';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'course' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: object;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

export function SEO({
  title = `${SITE_NAME} — Professional IELTS Tayyorlov Kurslari`,
  description = 'IELTS Imperia — Xorazmdagi eng zo\'r IELTS o\'quv markazi. Professional ekspertlar bilan IELTS 8.0+ natijani qo\'lga kiriting. Speaking, Writing va Mock imtihonlari.',
  keywords = 'IELTS, IELTS Xorazm, IELTS Urganch, IELTS tayyorlov, IELTS 8.0, IELTS kursi, ingliz tili, speaking, writing, mock exam, IELTS Imperia',
  image = 'https://i.postimg.cc/6p3hXq3L/IELTS-Imperia-logo.jpg',
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = 'website',
  author = SITE_NAME,
  publishedTime,
  modifiedTime,
  structuredData,
  noindex = false,
  nofollow = false,
  canonical,
}: SEOProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : SITE_URL;
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const canonicalUrl = canonical || fullUrl;

  // Enhanced keywords with common search terms - SEO optimized
  const enhancedKeywords = keywords +
    ', IELTS Imperia, Xorazm, Urganch, o\'quv markazi, IELTS o\'quv markazi, ' +
    'ingliz tili kurslari, speaking club, writing task, mock exam, ' +
    'IELTS instructor, 8.0, 7.5, band score, ' +
    'professional ta\'lim, sertifikat, natijalar, ' +
    'o\'qituvchilar, ekspertlar, kafolatlangan natija';

  useEffect(() => {
    // Document title
    document.title = fullTitle;

    // Meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', enhancedKeywords);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Robots meta
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    const robotsContent = [
      noindex ? 'noindex' : 'index',
      nofollow ? 'nofollow' : 'follow',
    ].join(', ');
    robots.setAttribute('content', robotsContent);

    // Additional meta tags
    let metaAuthor = document.querySelector('meta[name="author"]');
    if (!metaAuthor) {
      metaAuthor = document.createElement('meta');
      metaAuthor.setAttribute('name', 'author');
      document.head.appendChild(metaAuthor);
    }
    metaAuthor.setAttribute('content', author);

    // Language meta - Enhanced
    let metaLang = document.querySelector('html');
    if (metaLang) {
      metaLang.setAttribute('lang', 'uz');
      metaLang.setAttribute('xml:lang', 'uz');
    }

    // Content language
    let contentLang = document.querySelector('meta[http-equiv="content-language"]');
    if (!contentLang) {
      contentLang = document.createElement('meta');
      contentLang.setAttribute('http-equiv', 'content-language');
      document.head.appendChild(contentLang);
    }
    contentLang.setAttribute('content', 'uz, ru, en');

    // Theme color for mobile browsers
    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColor);
    }
    themeColor.setAttribute('content', '#3b82f6');

    // Mobile web app capable
    let mobileWebApp = document.querySelector('meta[name="mobile-web-app-capable"]');
    if (!mobileWebApp) {
      mobileWebApp = document.createElement('meta');
      mobileWebApp.setAttribute('name', 'mobile-web-app-capable');
      document.head.appendChild(mobileWebApp);
    }
    mobileWebApp.setAttribute('content', 'yes');

    // Apple mobile web app
    let appleMobileWebApp = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleMobileWebApp) {
      appleMobileWebApp = document.createElement('meta');
      appleMobileWebApp.setAttribute('name', 'apple-mobile-web-app-capable');
      document.head.appendChild(appleMobileWebApp);
    }
    appleMobileWebApp.setAttribute('content', 'yes');

    // Apple mobile web app title
    let appleMobileWebAppTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]');
    if (!appleMobileWebAppTitle) {
      appleMobileWebAppTitle = document.createElement('meta');
      appleMobileWebAppTitle.setAttribute('name', 'apple-mobile-web-app-title');
      document.head.appendChild(appleMobileWebAppTitle);
    }
    appleMobileWebAppTitle.setAttribute('content', SITE_NAME);

    // Open Graph tags - Enhanced
    const ogTags = [
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: fullImageUrl },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: fullTitle },
      { property: 'og:url', content: fullUrl },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: 'IELTS Imperia' },
      { property: 'og:locale', content: 'uz_UZ' },
      { property: 'og:locale:alternate', content: 'ru_RU' },
      { property: 'og:locale:alternate', content: 'en_US' },
      { property: 'og:image:secure_url', content: fullImageUrl },
      { property: 'og:image:type', content: 'image/jpeg' },
    ];

    if (publishedTime) {
      ogTags.push({ property: 'article:published_time', content: publishedTime });
    }
    if (modifiedTime) {
      ogTags.push({ property: 'article:modified_time', content: modifiedTime });
    }
    if (author) {
      ogTags.push({ property: 'article:author', content: author });
    }

    ogTags.forEach(({ property, content }) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // Twitter Card tags - Enhanced
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: fullImageUrl },
      { name: 'twitter:image:alt', content: fullTitle },
      { name: 'twitter:site', content: '@ieltsimperia' },
      { name: 'twitter:creator', content: '@ieltsimperia' },
    ];

    twitterTags.forEach(({ name, content }) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    });

    // Structured Data (JSON-LD) - Multiple schemas support
    if (structuredData) {
      // Oldingi structured data ni o'chirish
      const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
      existingScripts.forEach(script => script.remove());

      // Array bo'lsa, har birini alohida qo'shamiz
      const schemas = Array.isArray(structuredData) ? structuredData : [structuredData];

      schemas.forEach((schema) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
      });
    }

    // Additional SEO meta tags
    // Geo location
    let geoRegion = document.querySelector('meta[name="geo.region"]');
    if (!geoRegion) {
      geoRegion = document.createElement('meta');
      geoRegion.setAttribute('name', 'geo.region');
      document.head.appendChild(geoRegion);
    }
    geoRegion.setAttribute('content', 'UZ-TK');

    // Language alternates
    const languages = ['uz', 'ru', 'en'];
    languages.forEach((lang) => {
      let alternate = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
      if (!alternate) {
        alternate = document.createElement('link');
        alternate.setAttribute('rel', 'alternate');
        alternate.setAttribute('hreflang', lang);
        document.head.appendChild(alternate);
      }
      alternate.setAttribute('href', fullUrl);
    });

    // Default language
    let defaultLang = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
    if (!defaultLang) {
      defaultLang = document.createElement('link');
      defaultLang.setAttribute('rel', 'alternate');
      defaultLang.setAttribute('hreflang', 'x-default');
      document.head.appendChild(defaultLang);
    }
    defaultLang.setAttribute('href', fullUrl);
  }, [fullTitle, description, enhancedKeywords, fullImageUrl, fullUrl, type, author, publishedTime, modifiedTime, structuredData, canonicalUrl]);

  return null;
}


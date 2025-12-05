// SEO utility functions

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'course' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

// Site base URL
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://aplusacademy.uz';
export const SITE_NAME = 'A+ Academy';

// Generate structured data for courses
export function generateCourseStructuredData(course: {
  name: string;
  description: string;
  price: string;
  image?: string;
  teacher?: string;
  duration?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    ...(course.price && {
      offers: {
        '@type': 'Offer',
        price: course.price.replace(/[^\d]/g, ''),
        priceCurrency: 'UZS',
      },
    }),
    ...(course.image && {
      image: course.image.startsWith('http') ? course.image : `${SITE_URL}${course.image}`,
    }),
    ...(course.teacher && {
      instructor: {
        '@type': 'Person',
        name: course.teacher,
      },
    }),
    ...(course.duration && {
      timeRequired: course.duration,
    }),
  };
}

// Generate structured data for organization
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_NAME,
    description: 'A+ Academy — IT, tillar va abituriyentlar uchun zamonaviy ta\'lim markazi',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Toshkent',
      addressCountry: 'UZ',
    },
    sameAs: [
      'https://www.facebook.com/aplusacademy',
      'https://www.instagram.com/aplusacademy',
      'https://t.me/aplusacademy',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Uzbek', 'Russian', 'English'],
    },
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

// Generate FAQ structured data
export function generateFAQStructuredData(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}


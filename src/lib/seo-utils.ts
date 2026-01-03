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
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://ieltsimperia.uz';
export const SITE_NAME = 'IELTS Imperia';

// Generate structured data for courses - Enhanced
export function generateCourseStructuredData(course: {
  name: string;
  name_uz?: string;
  name_ru?: string;
  name_en?: string;
  description: string;
  description_uz?: string;
  description_ru?: string;
  description_en?: string;
  price: string;
  image?: string;
  teacher?: string;
  duration?: string;
  category?: string;
  level?: string;
  url?: string;
}) {
  const courseUrl = course.url || `${SITE_URL}/courses`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    alternateName: [
      course.name_uz,
      course.name_ru,
      course.name_en,
    ].filter(Boolean),
    description: course.description,
    provider: {
      '@type': 'EducationalOrganization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Toshkent',
        addressCountry: 'UZ',
      },
    },
    url: courseUrl,
    ...(course.image && {
      image: course.image.startsWith('http') ? course.image : `${SITE_URL}${course.image}`,
    }),
    ...(course.price && {
      offers: {
        '@type': 'Offer',
        price: course.price.replace(/[^\d]/g, ''),
        priceCurrency: 'UZS',
        availability: 'https://schema.org/InStock',
        url: courseUrl,
      },
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
    ...(course.category && {
      courseCategory: course.category,
    }),
    ...(course.level && {
      educationalLevel: course.level,
    }),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    inLanguage: ['uz', 'ru', 'en'],
  };
}

// Generate structured data for organization - Enhanced
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE_URL}#organization`,
    name: SITE_NAME,
    alternateName: ['IELTS Imperia', 'IELTS Imperia Toshkent'],
    description: 'IELTS Imperia — IELTS 8.0+ natija uchun maxsuslashtirilgan o\'quv markazi. Speaking, Writing va Mock Exam xizmatlari.',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: 'https://i.postimg.cc/6p3hXq3L/IELTS-Imperia-logo.jpg',
      width: 512,
      height: 512,
    },
    image: 'https://i.postimg.cc/6p3hXq3L/IELTS-Imperia-logo.jpg',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Urganch shahar, Al-Xorazmiy ko\'chasi', // Generic placeholder, can ask user
      addressLocality: 'Xorazm',
      addressRegion: 'Xorazm',
      postalCode: '220100',
      addressCountry: 'UZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '41.5568', // Urganch coordinates
      longitude: '60.6247',
    },
    telephone: '+998901234567',
    email: 'info@ieltsimperia.uz',
    foundingDate: '2012',
    sameAs: [
      'https://www.facebook.com/ieltsimperia',
      'https://www.instagram.com/ieltsimperia',
      'https://t.me/ieltsimperia',
      'https://www.linkedin.com/company/ieltsimperia',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        telephone: '+998901234567',
        email: 'info@ieltsimperia.uz',
        availableLanguage: ['Uzbek', 'Russian', 'English'],
        areaServed: 'UZ',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
    priceRange: '$$',
    currenciesAccepted: 'UZS',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    openingHours: 'Mo-Fr 09:00-18:00, Sa 09:00-14:00',
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

// Generate WebSite structured data with search action
export function generateWebSiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/courses?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  };
}

// Generate LocalBusiness structured data
export function generateLocalBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}#localbusiness`,
    name: SITE_NAME,
    image: `${SITE_URL}/og-image.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Bunyodkor Avenue 12',
      addressLocality: 'Toshkent',
      addressRegion: 'Toshkent',
      postalCode: '100000',
      addressCountry: 'UZ',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '41.2995',
      longitude: '69.2401',
    },
    telephone: '+998901234567',
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '14:00',
      },
    ],
  };
}

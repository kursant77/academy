// Analytics utility functions

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    ym?: (id: number, action: string, target: any, params?: any) => void;
    dataLayer?: any[];
  }
}

// Google Analytics
export function trackPageView(url: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || '', {
      page_path: url,
    });
  }
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

// Yandex Metrica
export function trackYandexEvent(target: string, params?: any) {
  if (typeof window !== 'undefined' && window.ym && import.meta.env.VITE_YANDEX_METRICA_ID) {
    const id = parseInt(import.meta.env.VITE_YANDEX_METRICA_ID);
    window.ym(id, 'reachGoal', target, params);
  }
}

// Initialize analytics
export function initAnalytics() {
  // Google Analytics
  if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`;
    document.head.appendChild(gaScript);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: any[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID);
  }

  // Yandex Metrica
  if (import.meta.env.VITE_YANDEX_METRICA_ID) {
    const ymId = parseInt(import.meta.env.VITE_YANDEX_METRICA_ID);

    window.ym = window.ym || function (...args: any[]) {
      (window.ym as any).a = (window.ym as any).a || [];
      (window.ym as any).a.push(args);
    };
    (window.ym as any).l = new Date().getTime();

    const ymScript = document.createElement('script');
    ymScript.async = true;
    ymScript.src = 'https://mc.yandex.ru/metrika/tag.js';
    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(ymScript, firstScript);
    } else {
      document.head.appendChild(ymScript);
    }

    window.ym(ymId, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });
  }
}


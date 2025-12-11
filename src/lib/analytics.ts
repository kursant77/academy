// Analytics utility functions

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    ym?: (id: number, action: string, target: string, params?: any) => void;
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
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID);
  }

  // Yandex Metrica
  if (import.meta.env.VITE_YANDEX_METRICA_ID) {
    (function(m: any, e: string, t: string, r: string, i: string, k: string, a: string) {
      m[i] = m[i] || function() { (m[i].a = m[i].a || []).push(arguments) };
      m[i].l = 1 * new Date();
      k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, a.parentNode.insertBefore(k, a)
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    
    const id = parseInt(import.meta.env.VITE_YANDEX_METRICA_ID);
    window.ym(id, 'init', {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
    });
  }
}


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ContentResponse {
  [key: string]: string | undefined;
  address?: string;
  phone?: string;
  email?: string;
  hours_week?: string;
  hours_sat?: string;
  hours_sun?: string;
  facebook?: string;
  instagram?: string;
  telegram?: string;
  youtube?: string;
  linkedin?: string;
  twitter?: string;
  title?: string;
  subtitle?: string;
  primary_cta?: string;
  secondary_cta?: string;
}

export function useContent(page: string, language: string) {
  const [content, setContent] = useState<ContentResponse>({});

  useEffect(() => {
    async function load() {
      try {
        // Social section uchun locale'ni e'tiborsiz qoldirish
        let query = supabase
          .from('content_blocks')
          .select('content_key, value, locale, updated_at')
          .eq('section', page);

        // Social section bo'lsa, locale'ni e'tiborsiz qoldirish
        if (page === 'social') {
          // Social section uchun barcha locale'larni olish, eng so'nggi yangilanganidan boshlab
          const { data, error } = await query.order('updated_at', { ascending: false });

          if (error) {
            console.error("Content load error:", error);
            return;
          }

          // Helper to sanitize content (trims and returns undefined for empty values)
          const sanitize = (val: string | null | undefined) => {
            if (val == null) return undefined;
            const trimmed = String(val).trim();
            if (!trimmed) return undefined;
            return trimmed
              .replace(/A\+\s*Academy/gi, "IELTS Imperia")
              .replace(/A\+/g, "IELTS Imperia")
              .replace(/Academy/g, "IELTS Imperia");
          };

          // Ma'lumotlarni object'ga aylantirish (eng yangi to'liq qiymatni olish)
          const contentObj: ContentResponse = {};
          if (data) {
            data.forEach((item) => {
              const key = item.content_key as keyof ContentResponse;
              // agar allaqachon qiymat mavjud bo'lsa o'tib ketamiz (oldindan eng yangi qiymat saqlangan)
              if (contentObj[key]) return;
              const sanitized = sanitize(item.value);
              if (sanitized !== undefined) {
                contentObj[key] = sanitized;
              }
            });
          }

          // DEBUG: log social content to help diagnose missing links
          // console.debug('Loaded social content:', contentObj);

          setContent(contentObj);
        } else {
          // Boshqa section'lar uchun locale'ga qarab qidirish
          const { data, error } = await query.eq('locale', language);

          if (error) {
            console.error("Content load error:", error);
            // Fallback: localStorage'dan olish
            const saved = localStorage.getItem(`content_${page}_${language}`);
            if (saved) {
              setContent(JSON.parse(saved));
            }
            return;
          }

          // Ma'lumotlarni object'ga aylantirish
          const contentObj: ContentResponse = {};
          if (data) {
            data.forEach((item) => {
              // Sanitize values
              const val = item.value
                .replace(/A\+\s*Academy/gi, "IELTS Imperia")
                .replace(/A\+/g, "IELTS Imperia");
              contentObj[item.content_key as keyof ContentResponse] = val;
            });
          }

          setContent(contentObj);
        }
      } catch (error) {
        console.error("Content load error:", error);
        // Fallback: localStorage'dan olish
        const saved = localStorage.getItem(`content_${page}_${language}`);
        if (saved) {
          setContent(JSON.parse(saved));
        }
      }
    }

    load();
  }, [page, language]);

  return { content, setContent };
}

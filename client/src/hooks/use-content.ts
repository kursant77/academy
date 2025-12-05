import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ContentResponse {
  address?: string;
  phone?: string;
  email?: string;
  hours_week?: string;
  hours_sat?: string;
  hours_sun?: string;
  facebook?: string;
  instagram?: string;
  telegram?: string;
}

export function useContent(page: string, language: string) {
  const [content, setContent] = useState<ContentResponse>({});

  useEffect(() => {
    async function load() {
      try {
        // Supabase'dan content_blocks jadvalidan ma'lumotlarni olish
        const { data, error } = await supabase
          .from('content_blocks')
          .select('content_key, value')
          .eq('section', page)
          .eq('locale', language);

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
            contentObj[item.content_key as keyof ContentResponse] = item.value;
          });
        }

        setContent(contentObj);
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

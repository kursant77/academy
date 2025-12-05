import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EventCard } from "@/components/EventCard";
import { supabase } from "@/lib/supabase";
import type { Event } from "@shared/schema";
import { SEO } from "@/components/SEO";

export default function Events() {
  const { t, i18n } = useTranslation();
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      // Avval filterlarsiz olamiz, keyin client-side filter qilamiz
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Events error:', error);
        setAllEvents([]);
      } else {
        // Client-side filter: agar is_published ustuni mavjud bo'lsa, filter qo'llaymiz
        const filtered = (data || []).filter(event => {
          if (event.is_published !== undefined) {
            return event.is_published === true;
          }
          return true; // Agar ustun mavjud bo'lmasa, barchasini ko'rsatamiz
        });
        setAllEvents(filtered);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setAllEvents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Tadbirlar va Yangiliklar"
        description="A+ Academy tadbirlari, workshoplar, seminarlar va musobaqalar. Eng so'nggi yangiliklar va voqealar haqida bilib oling."
        keywords="tadbirlar, workshop, seminar, musobaqa, A+ Academy yangiliklari"
        url="/events"
      />
      <div className="min-h-screen py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8 md:mb-12 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("events.title")}</h1>
            <p className="text-lg text-muted-foreground">{t("events.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.map((event, index) => (
              <div key={event.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <EventCard
                  id={event.id}
                  title={
                    i18n.language === "uz" ? event.title_uz :
                    i18n.language === "ru" ? event.title_ru :
                    event.title_en
                  }
                  description={
                    i18n.language === "uz" ? event.description_uz :
                    i18n.language === "ru" ? event.description_ru :
                    event.description_en
                  }
                  date={new Date(event.date)}
                  category={event.category}
                  imageUrl={event.image_url || undefined}
                  isFeatured={event.featured || false}
                />
              </div>
            ))}
          </div>

          {allEvents.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-muted-foreground text-lg">{t("events.noEvents") || "Tadbirlar topilmadi"}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

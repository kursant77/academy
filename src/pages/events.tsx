import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EventCard } from "@/components/EventCard";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { Event } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { Calendar } from "lucide-react";

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
      <>
        <SEO
          title="Tadbirlar va Yangiliklar"
          description="IELTS Imperia tadbirlari, workshoplar, seminarlar va musobaqalar. Eng so'nggi yangiliklar va voqealar haqida bilib oling."
          keywords="tadbirlar, workshop, seminar, musobaqa, IELTS Imperia yangiliklari"
          url="/events"
        />
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground text-lg">Yuklanmoqda...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Tadbirlar va Yangiliklar — IELTS Imperia | Workshoplar, Seminarlar Toshkent"
        description="IELTS Imperia tadbirlari, workshoplar, seminarlar va musobaqalar. Eng so'nggi yangiliklar va voqealar haqida bilib oling. Toshkent. Qatnashish uchun ro'yxatdan o'ting!"
        keywords="tadbirlar, workshop, seminar, musobaqa, IELTS Imperia yangiliklari, Toshkent tadbirlar, IT tadbirlar, ta'lim tadbirlar, o'quv markazi tadbirlar, yangiliklar, voqealar, IT workshop, dasturlash tadbirlari, ta'lim tadbirlari"
        url="/events"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "IELTS Imperia Tadbirlari",
          "description": "Workshoplar, seminarlar va musobaqalar",
          "itemListElement": allEvents.map((event, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Event",
              "name": i18n.language === "uz" ? event.title_uz : i18n.language === "ru" ? event.title_ru : event.title_en,
              "description": i18n.language === "uz" ? event.description_uz : i18n.language === "ru" ? event.description_ru : event.description_en,
              "startDate": event.date,
              "organizer": {
                "@type": "Organization",
                "name": "IELTS Imperia"
              }
            }
          }))
        }}
      />
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl animate-float" />
          <div className="absolute inset-0 bg-pattern-dots opacity-20" />
        </div>

        <div className="relative py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Hero Section */}
            <div className="mb-8 sm:mb-10 md:mb-12 lg:mb-16 text-center animate-fade-in-down">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-4 sm:mb-6 backdrop-blur-sm border border-primary/20 animate-bounce-in">
                <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient px-2" style={{ height: '65px' }}>
                {t("events.title")}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
                {t("events.subtitle")}
              </p>
            </div>

            {/* Events Grid with Carousel Animation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {allEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="group animate-fade-in-up card-hover-lift hover:z-10"
                  style={{
                    animationDelay: `${index * 0.08}s`
                  }}
                >
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

            {/* Empty State */}
            {allEvents.length === 0 && (
              <Card className="border-dashed border-2 bg-card/50 backdrop-blur-sm col-span-full">
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                    <Calendar className="w-10 h-10 text-primary/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("events.noEvents")}</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {t("events.noEventsDesc")}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

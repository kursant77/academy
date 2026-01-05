import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { TeacherCard } from "@/components/TeacherCard";
import { supabase } from "@/lib/supabase";
import type { Teacher } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { Loader2 } from "lucide-react";

export default function Teachers() {
  const { t, i18n } = useTranslation();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Teachers error:", error);
        setTeachers([]);
      } else {
        setTeachers(data || []);
      }
    } catch (error) {
      console.error("Error loading teachers:", error);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <SEO
          title="O'qituvchilar"
          description="IELTS Imperia professional o'qituvchilari. IT, IELTS, CEFR va boshqa kurslar bo'yicha tajribali mutaxassislar."
          keywords="o'qituvchilar, IELTS Imperia, IT o'qituvchilari, IELTS o'qituvchilari"
          url="/teachers"
        />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title="O'qituvchilar — IELTS Imperia | Professional O'qituvchilar Toshkent"
        description="IELTS Imperia professional o'qituvchilari. IT, IELTS, CEFR va dasturlash bo'yicha 5+ yillik tajribaga ega mutaxassislar. Toshkent. Batafsil ma'lumot."
        keywords="o'qituvchilar, IELTS Imperia o'qituvchilari, IT o'qituvchilari, IELTS o'qituvchilari, dasturlash o'qituvchilari, professional o'qituvchilar, Toshkent o'qituvchilar, tajribali o'qituvchilar, mutaxassislar"
        url="/teachers"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "IELTS Imperia O'qituvchilari",
          "description": "Professional o'qituvchilar ro'yxati",
          "itemListElement": teachers.map((teacher, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Person",
              "name": teacher.name,
              "jobTitle": i18n.language === "uz" ? teacher.specialty_uz : i18n.language === "ru" ? teacher.specialty_ru : teacher.specialty_en,
              "worksFor": {
                "@type": "EducationalOrganization",
                "name": "IELTS Imperia"
              }
            }
          }))
        }}
      />
      <div className="min-h-screen relative overflow-hidden">
        {/* Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-pattern-dots opacity-20 -z-10" />

        <div className="relative py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Header */}
            <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 space-y-3 sm:space-y-4 animate-fade-in-down">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent px-2" style={{ height: '68px' }}>
                {t("teachers.title")}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
                {t("teachers.subtitle")}
              </p>
            </div>

            {/* Teachers Grid */}
            {teachers.length === 0 ? (
              <div className="text-center py-12 sm:py-16 md:py-20">
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{t("teachers.noTeachers")}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t("teachers.noTeachersDesc")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {teachers.map((teacher, index) => (
                  <div
                    key={teacher.id}
                    className="animate-fade-in-up card-hover-lift"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <TeacherCard
                      id={teacher.id}
                      name={teacher.name}
                      specialty={
                        i18n.language === "uz"
                          ? teacher.specialty_uz
                          : i18n.language === "ru"
                            ? teacher.specialty_ru
                            : teacher.specialty_en
                      }
                      experience={teacher.experience}
                      bio={
                        i18n.language === "uz"
                          ? teacher.bio_uz
                          : i18n.language === "ru"
                            ? teacher.bio_ru
                            : teacher.bio_en
                      }
                      imageUrl={teacher.image_url || undefined}
                      linkedIn={teacher.linked_in || undefined}
                      telegram={teacher.telegram || undefined}
                      instagram={teacher.instagram || undefined}
                      isFeatured={teacher.featured || false}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


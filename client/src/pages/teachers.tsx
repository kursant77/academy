import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { TeacherCard } from "@/components/TeacherCard";
import { supabase } from "@/lib/supabase";
import type { Teacher } from "@shared/schema";
import { SEO } from "@/components/SEO";

export default function Teachers() {
  const { t, i18n } = useTranslation();
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllTeachers(data || []);
    } catch (error) {
      console.error('Error loading teachers:', error);
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
        title="O'qituvchilar"
        description="A+ Academy professional o'qituvchilari. 5+ yillik tajribaga ega mutaxassislar sizga eng yaxshi ta'limni berishadi."
        keywords="o'qituvchilar, A+ Academy, professional o'qituvchilar, IT o'qituvchilari, ingliz tili o'qituvchilari"
        url="/teachers"
      />
      <div className="min-h-screen py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8 md:mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("teachers.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("teachers.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {allTeachers.map((teacher, index) => (
            <div key={teacher.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <TeacherCard
                id={teacher.id}
                name={teacher.name}
                specialty={
                  i18n.language === "uz" ? teacher.specialty_uz :
                  i18n.language === "ru" ? teacher.specialty_ru :
                  teacher.specialty_en
                }
                experience={teacher.experience}
                bio={
                  i18n.language === "uz" ? teacher.bio_uz :
                  i18n.language === "ru" ? teacher.bio_ru :
                  teacher.bio_en
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

        {allTeachers.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-muted-foreground text-lg">{t("teachers.noTeachers") || "O'qituvchilar topilmadi"}</p>
          </div>
        )}
      </div>
    </>
  );
}

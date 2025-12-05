import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Course, Category } from "@shared/schema";
import { SEO } from "@/components/SEO";

interface CourseWithTeacher extends Course {
  teachers?: { name: string } | null;
}

export default function Courses() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [allCourses, setAllCourses] = useState<CourseWithTeacher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Avval filterlarsiz olamiz, keyin client-side filter qilamiz
      const [coursesRes, categoriesRes] = await Promise.all([
        supabase
          .from('courses')
          .select(`
            *,
            teachers:teacher_id (
              name
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .eq('type', 'course')
          .order('name_uz'),
      ]);

      if (coursesRes.error) {
        console.error('Error loading courses:', coursesRes.error);
        setAllCourses([]);
      } else {
        // Client-side filter: agar is_published ustuni mavjud bo'lsa, filter qo'llaymiz
        const filtered = (coursesRes.data || []).filter(course => {
          if (course.is_published !== undefined) {
            return course.is_published === true;
          }
          return true; // Agar ustun mavjud bo'lmasa, barchasini ko'rsatamiz
        });
        setAllCourses(filtered);
      }
      
      if (categoriesRes.error) {
        console.error('Error loading categories:', categoriesRes.error);
      } else {
        setCategories(categoriesRes.data || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: 'Xatolik',
        description: 'Kurslar yuklanmadi. Iltimos, qayta urinib ko\'ring.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const categoryFilters = useMemo(() => {
    return [
      { value: "all", label: t("courses.all") },
      ...categories.map((category) => ({
        value: category.name_uz,
        label:
          i18n.language === "ru"
            ? category.name_ru
            : i18n.language === "en"
            ? category.name_en
            : category.name_uz,
      })),
    ];
  }, [categories, i18n.language, t]);

  const filteredCourses = selectedCategory === "all"
    ? allCourses
    : allCourses.filter((course) => course.category === selectedCategory);

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "A+ Academy - Barcha Kurslar",
    "description": "Professional IT, IELTS, CEFR va boshqa kurslar",
    "itemListElement": filteredCourses.map((course, index) => ({
      "@type": "Course",
      "position": index + 1,
      "name": i18n.language === "uz" ? course.name_uz : i18n.language === "ru" ? course.name_ru : course.name_en,
      "description": i18n.language === "uz" ? course.description_uz : i18n.language === "ru" ? course.description_ru : course.description_en,
      "provider": {
        "@type": "EducationalOrganization",
        "name": "A+ Academy"
      }
    }))
  }), [filteredCourses, i18n.language]);

  if (loading) {
    return (
      <>
        <SEO 
          title="Kurslar — A+ Academy"
          description="Professional IT, IELTS, CEFR va boshqa kurslar. A+ Academy da o'qing va martaba quring."
        />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Kurslar — A+ Academy"
        description="Professional IT, IELTS, CEFR va boshqa kurslar. A+ Academy da o'qing va martaba quring."
        keywords="IELTS kurslar, CEFR, IT kurslar, dasturlash, ingliz tili kurslar"
        structuredData={structuredData}
      />
      <div className="min-h-screen py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8 md:mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("courses.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("courses.subtitle")}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>{t("courses.filter")}:</span>
          </div>
          {categoryFilters.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              data-testid={`filter-${category.value}`}
              className="transition-all hover:scale-105"
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <div key={course.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <CourseCard
                id={course.id}
                name={
                  i18n.language === "uz" ? course.name_uz :
                  i18n.language === "ru" ? course.name_ru :
                  course.name_en
                }
                description={
                  i18n.language === "uz" ? course.description_uz :
                  i18n.language === "ru" ? course.description_ru :
                  course.description_en
                }
                category={course.category}
                duration={course.duration}
                price={course.price}
                level={course.level}
                teacherName={course.teachers?.name || "N/A"}
                imageUrl={course.image_url || undefined}
              />
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <p className="text-muted-foreground text-lg">{t("courses.noCourses") || "Kurslar topilmadi"}</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Filter, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { Course, Category } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { generateWebSiteStructuredData } from "@/lib/seo-utils";

interface CourseWithTeacher extends Course {
  teachers?: { name: string } | null;
  categories?: { id: string; name_uz: string; name_ru: string; name_en: string } | null;
}

export default function Courses() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [allCourses, setAllCourses] = useState<CourseWithTeacher[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Debounce loadData to avoid multiple calls
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const loadData = async () => {
    try {
      // System options jadvalidan kurs kategoriyalarini yuklaymiz (admin panelda ishlatiladi)
      // Keyin courses yuklaymiz
      const [categoriesRes, coursesRes] = await Promise.all([
        supabase
          .from('system_options')
          .select('*')
          .eq('option_type', 'course_category')
          .eq('is_active', true)
          .order('sort_order'),
        supabase
          .from('courses')
          .select(`
            *,
            teachers:teacher_id (
              name
            )
          `)
          .order('created_at', { ascending: false }),
      ]);

      // Categories yuklash (system_options jadvalidan)
      if (categoriesRes.error) {
        console.error('Error loading categories:', categoriesRes.error);
        setCategories([]);
      } else {
        // system_options formatini categories formatiga o'tkazamiz
        const formattedCategories: Category[] = (categoriesRes.data || []).map(cat => ({
          id: cat.id,
          name: cat.name_uz, // name maydoni kerak (Category type'ida)
          name_uz: cat.name_uz,
          name_ru: cat.name_ru,
          name_en: cat.name_en,
          type: 'course' as const,
          created_at: cat.created_at,
          updated_at: cat.updated_at
        }));
        setCategories(formattedCategories);
      }

      // Courses yuklash
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

        // Category ma'lumotlarini qo'shamiz (client-side join)
        // Kurslarda category maydoni name_uz sifatida saqlanadi, shuning uchun name_uz orqali solishtiramiz
        const coursesWithCategories = filtered.map(course => {
          // category maydoni name_uz qiymatini o'z ichiga oladi (admin panelda tanlanadi)
          const categoryData = categoriesRes.data?.find(cat =>
            cat.name_uz === course.category ||
            cat.name_ru === course.category ||
            cat.name_en === course.category
          );

          return {
            ...course,
            categories: categoryData ? {
              id: categoryData.id,
              name_uz: categoryData.name_uz,
              name_ru: categoryData.name_ru,
              name_en: categoryData.name_en
            } : null,
            // category_id ni ham to'ldiramiz (agar mavjud bo'lsa)
            category_id: categoryData?.id || course.category_id || null
          };
        });

        setAllCourses(coursesWithCategories);
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
        value: category.id, // Category ID dan foydalanamiz
        label:
          i18n.language === "ru"
            ? category.name_ru
            : i18n.language === "en"
              ? category.name_en
              : category.name_uz,
      })),
    ];
  }, [categories, i18n.language, t]);

  const filteredCourses = useMemo(() => {
    if (selectedCategory === "all") {
      return allCourses;
    }

    // Tanlangan kategoriya ma'lumotlarini topamiz
    const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
    if (!selectedCategoryData) {
      return allCourses; // Agar kategoriya topilmasa, barcha kurslarni ko'rsatamiz
    }

    // Category ID yoki category nomi orqali filter qilish
    const filtered = allCourses.filter((course) => {
      // 1. Joined category ma'lumotlari orqali tekshiramiz (eng ishonchli)
      if (course.categories?.id === selectedCategory) {
        return true;
      }

      // 2. category_id orqali tekshiramiz (to'g'ridan-to'g'ri UUID solishtirish)
      if (course.category_id === selectedCategory) {
        return true;
      }

      // 3. category maydoni orqali tekshiramiz (admin panelda name_uz sifatida saqlanadi)
      // Barcha tildagi variantlarni tekshiramiz
      const categoryNames = [
        selectedCategoryData.name_uz,
        selectedCategoryData.name_ru,
        selectedCategoryData.name_en
      ];

      if (course.category && categoryNames.includes(course.category)) {
        return true;
      }

      return false;
    });


    return filtered;
  }, [allCourses, selectedCategory, categories, i18n.language]);

  const structuredData = useMemo(() => {
    return [
      generateWebSiteStructuredData(),
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "IELTS Imperia - Barcha Kurslar | IT, IELTS, CEFR Kurslar Toshkent",
        "description": "Professional IT, IELTS, CEFR va boshqa kurslar. Toshkentdagi eng yaxshi o'quv markazi.",
        "url": typeof window !== 'undefined' ? window.location.href : 'https://ieltsimperia.uz/courses',
        "numberOfItems": filteredCourses.length,
        "itemListElement": filteredCourses.map((course, index) => {
          const courseName = i18n.language === "uz" ? course.name_uz : i18n.language === "ru" ? course.name_ru : course.name_en;
          const courseDesc = i18n.language === "uz" ? course.description_uz : i18n.language === "ru" ? course.description_ru : course.description_en;

          return {
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Course",
              "name": courseName,
              "description": courseDesc,
              "url": typeof window !== 'undefined' ? `${window.location.origin}/courses` : 'https://ieltsimperia.uz/courses',
              "provider": {
                "@type": "EducationalOrganization",
                "name": "IELTS Imperia",
                "url": "https://ieltsimperia.uz"
              },
              "offers": {
                "@type": "Offer",
                "price": course.price.replace(/[^\d]/g, ''),
                "priceCurrency": "UZS"
              },
              ...(course.image_url && {
                "image": course.image_url.startsWith('http') ? course.image_url : `https://ieltsimperia.uz${course.image_url}`
              })
            }
          };
        })
      }
    ];
  }, [filteredCourses, i18n.language]);

  if (loading) {
    return (
      <>
        <SEO
          title="Kurslar — IELTS Imperia"
          description="Professional IT, IELTS, CEFR va boshqa kurslar. IELTS Imperia da o'qing va martaba quring."
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
        title="Kurslar — IELTS Imperia | IT, IELTS, CEFR, Dasturlash Kurslari Toshkent"
        description="IELTS Imperia kurslari: IT, IELTS, CEFR, dasturlash (React, JavaScript, Python, Node.js), ingliz tili. Professional o'qituvchilar, zamonaviy dasturlar. Toshkent. Ro'yxatdan o'ting!"
        keywords="kurslar, IT kurslar, IELTS kurslar, CEFR kurslar, dasturlash kurslari, frontend kurslar, backend kurslar, fullstack kurslar, React kurslar, JavaScript kurslar, Python kurslar, Node.js kurslar, ingliz tili kurslari, Toshkent kurslar, o'quv markazi kurslar, IELTS Imperia kurslar, professional kurslar, zamonaviy kurslar"
        structuredData={structuredData}
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
                <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient px-2" style={{ height: '70px' }}>
                {t("courses.title")}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
                {t("courses.subtitle")}
              </p>
            </div>

            {/* Filter Section */}
            <Card className="mb-6 sm:mb-8 md:mb-12 bg-card/50 backdrop-blur-sm border-2 border-border/50 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 sm:gap-2 md:gap-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground w-full sm:w-auto">
                    <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="font-medium">{t("courses.filter")}:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {categoryFilters.map((category) => (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.value)}
                        data-testid={`filter-${category.value}`}
                        className="text-xs sm:text-sm transition-all hover:scale-105 hover:shadow-lg h-8 sm:h-9 px-3 sm:px-4"
                      >
                        {category.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Courses Grid with Carousel Animation */}
            {filteredCourses.length === 0 ? (
              <Card className="border-dashed border-2 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-3 sm:mb-4">
                    <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-primary/50" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">{t("courses.noCourses")}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-md">
                    {t("courses.noCoursesDesc") || "No courses available. More coming soon."}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                {filteredCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="group animate-fade-in-up card-hover-lift hover:z-10"
                    style={{
                      animationDelay: `${index * 0.08}s`
                    }}
                  >
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
            )}
          </div>
        </div>
      </div>
    </>
  );
}

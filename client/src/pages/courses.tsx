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
    loadData();
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
        if (import.meta.env.DEV) {
          console.log('Loaded categories (from system_options):', formattedCategories.length);
        }
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
        
        // Debug: filter qanday ishlayotganini ko'rsatish
        if (import.meta.env.DEV) {
          console.log('Loaded courses:', coursesWithCategories.length);
          console.log('Sample course:', coursesWithCategories[0] ? {
            id: coursesWithCategories[0].id,
            name: coursesWithCategories[0].name_uz,
            category: coursesWithCategories[0].category,
            category_id: coursesWithCategories[0].category_id,
            categories: coursesWithCategories[0].categories
          } : null);
        }
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
    
    // Debug
    if (import.meta.env.DEV && selectedCategory !== "all") {
      const sampleCourse = allCourses[0];
      console.log('🔍 Filtering courses:', {
        selectedCategory,
        totalCourses: allCourses.length,
        filteredCount: filtered.length,
        availableCategories: categories.map(c => ({ id: c.id, name: c.name_uz })),
        sampleCourse: sampleCourse ? {
          id: sampleCourse.id,
          name: sampleCourse.name_uz,
          category_id: sampleCourse.category_id,
          category: sampleCourse.category,
          categories: sampleCourse.categories
        } : null,
        allCoursesCategoryIds: allCourses.map(c => ({ id: c.id, category_id: c.category_id, category: c.category }))
      });
    }
    
    return filtered;
  }, [allCourses, selectedCategory, categories, i18n.language]);

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
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="mb-12 md:mb-16 text-center animate-fade-in-down">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-6 backdrop-blur-sm border border-primary/20 animate-bounce-in">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                {t("courses.title")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("courses.subtitle")}
              </p>
            </div>

            {/* Filter Section */}
            <Card className="mb-8 md:mb-12 bg-card/50 backdrop-blur-sm border-2 border-border/50 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <div className="p-4 md:p-6">
                <div className="flex flex-wrap items-center gap-2 md:gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">{t("courses.filter")}:</span>
                  </div>
                  {categoryFilters.map((category) => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                      data-testid={`filter-${category.value}`}
                      className="transition-all hover:scale-105 hover:shadow-lg"
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Courses Grid with Carousel Animation */}
            {filteredCourses.length === 0 ? (
              <Card className="border-dashed border-2 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                    <BookOpen className="w-10 h-10 text-primary/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Kurslar topilmadi</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {t("courses.noCourses") || "Hozircha kurslar ro'yxati bo'sh. Tez orada qo'shiladi."}
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course, index) => (
                  <div 
                    key={course.id} 
                    className="group animate-fade-in-up hover:scale-[1.03] transition-all duration-500 hover:z-10"
                    style={{ 
                      animationDelay: `${index * 0.08}s`,
                      animation: `slideInUp 0.8s ease-out ${index * 0.08}s both, float 8s ease-in-out infinite ${index * 0.3}s`
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

import { useTranslation } from "react-i18next";
import { Hero } from "@/components/Hero";
import { StatsBar } from "@/components/StatsBar";
import { CourseCard } from "@/components/CourseCard";
import { TeacherCard } from "@/components/TeacherCard";
import { TestimonialSlider } from "@/components/TestimonialSlider";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Course, Teacher, Event, Testimonial as TestimonialRecord } from "@shared/schema";
import { useContent } from "@/hooks/use-content";
import { SEO } from "@/components/SEO";
import {
  generateOrganizationStructuredData,
  generateWebSiteStructuredData,
  generateLocalBusinessStructuredData
} from "@/lib/seo-utils";

interface CourseWithTeacher extends Course {
  teachers?: { name: string } | null;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const [featuredCourses, setFeaturedCourses] = useState<CourseWithTeacher[]>([]);
  const [featuredTeachers, setFeaturedTeachers] = useState<Teacher[]>([]);
  const [latestEvents, setLatestEvents] = useState<Event[]>([]);
  const [testimonialEntries, setTestimonialEntries] = useState<TestimonialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { content: ctaContent } = useContent("home_cta", i18n.language);

  useEffect(() => {
    // Debounce loadData to avoid multiple calls
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced structured data for SEO - Multiple schemas
  const structuredData = useMemo(() => {
    return [
      generateOrganizationStructuredData(),
      generateWebSiteStructuredData(),
      generateLocalBusinessStructuredData(),
    ];
  }, []);

  const loadData = async () => {
    try {
      // Load featured courses (limit 3) with teacher info
      // Avval barcha kurslarni olamiz, keyin client-side filter qilamiz
      let coursesQuery = supabase
        .from('courses')
        .select(`
          *,
          teachers:teacher_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      const { data: coursesData, error: coursesError } = await coursesQuery;

      if (coursesError) {
        console.error('Courses error:', coursesError);
        setFeaturedCourses([]);
      } else {
        // Client-side filter: featured va is_published bo'yicha
        const filtered = (coursesData || []).filter(course => {
          // Agar featured va is_published ustunlari mavjud bo'lsa, filter qo'llaymiz
          if (course.featured !== undefined && course.is_published !== undefined) {
            return course.featured === true && course.is_published === true;
          }
          // Agar featured mavjud bo'lsa, faqat featured kurslarni ko'rsatamiz
          if (course.featured !== undefined) {
            return course.featured === true;
          }
          // Agar is_published mavjud bo'lsa, faqat published kurslarni ko'rsatamiz
          if (course.is_published !== undefined) {
            return course.is_published === true;
          }
          // Agar ustunlar mavjud bo'lmasa, barchasini ko'rsatamiz
          return true;
        });
        // Featured kurslarni limit qilamiz
        setFeaturedCourses(filtered.slice(0, 3));
      }

      // Load featured teachers (limit 4)
      let teachersQuery = supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: teachersData, error: teachersError } = await teachersQuery;

      if (teachersError) {
        console.error('Teachers error:', teachersError);
        setFeaturedTeachers([]);
      } else {
        const filtered = (teachersData || []).filter(teacher => {
          if (teacher.featured !== undefined) {
            return teacher.featured === true;
          }
          return true;
        });
        setFeaturedTeachers(filtered.slice(0, 4));
      }

      // Load latest events (limit 3) - faqat featured va published
      let eventsQuery = supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false })
        .limit(10); // Ko'proq olish, keyin filter qilamiz

      const { data: eventsData, error: eventsError } = await eventsQuery;

      if (eventsError) {
        console.error('Events error:', eventsError);
        setLatestEvents([]);
      } else {
        // Agar ma'lumotlar bo'lsa, is_published va featured filter qo'llaymiz
        const filtered = (eventsData || []).filter(event => {
          // Agar is_published ustuni mavjud bo'lsa, filter qo'llaymiz
          if (event.is_published !== undefined && event.is_published !== true) {
            return false;
          }
          // Agar featured ustuni mavjud bo'lsa, faqat featured'larni ko'rsatamiz
          if (event.featured !== undefined && event.featured !== true) {
            return false;
          }
          // Agar ustunlar mavjud bo'lmasa, barchasini ko'rsatamiz
          return true;
        });
        setLatestEvents(filtered.slice(0, 3));
      }

      // Load testimonials
      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

      if (testimonialsError) {
        console.error('Testimonials error:', testimonialsError);
        setTestimonialEntries([]);
      } else {
        setTestimonialEntries(testimonialsData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const testimonials = useMemo(() => {
    if (testimonialEntries.length === 0) {
      return [
        {
          id: "placeholder-1",
          name: "Ali Karimov",
          course: "Frontend Development",
          text:
            i18n.language === "ru"
              ? "Обучение в IELTS Imperia изменило мою жизнь. Благодаря профессиональным преподавателям и современной программе я устроился на работу мечты."
              : i18n.language === "en"
                ? "Studying at IELTS Imperia changed my life. Thanks to professional teachers and modern curriculum, I got my dream job."
                : "IELTS Imperia o'quv markazida o'qish mening hayotimni o'zgartirdi. Professional o'qituvchilar va zamonaviy dastur tufayli men orzuimdagi ishga joylashdim.",
        },
      ];
    }

    return testimonialEntries.map((item) => ({
      id: item.id,
      name: item.name,
      course: item.course,
      text:
        i18n.language === "ru"
          ? item.text_ru
          : i18n.language === "en"
            ? item.text_en
            : item.text_uz,
      rating: item.rating,
    }));
  }, [testimonialEntries, i18n.language]);

  if (loading) {
    return (
      <>
        <SEO
          title="IELTS Imperia — Professional IT, IELTS & CEFR Kurslar"
          description="IELTS Imperia — IT, tillar va abituriyentlar uchun zamonaviy ta'lim markazi. Professional o'qituvchilar bilan yuqori natija kafolatlanadi."
          structuredData={structuredData}
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
        title="IELTS Imperia — Professional IT, IELTS & CEFR Kurslar | Toshkent O'quv Markazi"
        description="IELTS Imperia — Toshkentdagi eng yaxshi IT, IELTS, CEFR va dasturlash kurslari. Professional o'qituvchilar, zamonaviy dasturlar, kafolatlangan natija. 2500+ talaba, 1800+ bitiruvchi. Ro'yxatdan o'ting!"
        keywords="IELTS Imperia, Toshkent o'quv markazi, IT kurslar Toshkent, IELTS Toshkent, CEFR kurslar, dasturlash kurslari, frontend kurslar, backend kurslar, fullstack kurslar, ingliz tili kurslari, ta'lim markazi Toshkent, o'quv markazi Toshkent, IT o'quv markazi, IELTS o'quv markazi, professional ta'lim, zamonaviy ta'lim, React kurslar, JavaScript kurslar, Python kurslar, Node.js kurslar"
        structuredData={structuredData}
      />
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated background elements */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl animate-float" />
        </div>

        <Hero />
        <StatsBar />

        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20 relative animate-fade-in" aria-label="Kurslar bo'limi">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 sm:mb-8 md:mb-10 lg:mb-12 gap-4">
              <div className="animate-slide-in-left space-y-2 sm:space-y-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary px-2">
                  {t("courses.title")}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl px-2">{t("courses.subtitle")}</p>
              </div>
              <Link href="/courses" className="w-full sm:w-auto px-2">
                <Button variant="outline" className="gap-2 animate-slide-in-right shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm w-full sm:w-auto" data-testid="button-view-all-courses">
                  {t("courses.filter")}
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {featuredCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="animate-fade-in-up card-hover-lift group"
                  style={{ animationDelay: `${index * 0.1}s` }}
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
                    isFeatured={course.featured || false}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-muted/30 to-background animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 sm:mb-10 md:mb-12 lg:mb-16 gap-4">
              <div className="animate-slide-in-left space-y-2 sm:space-y-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
                  {t("teachers.title")}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl">{t("teachers.subtitle")}</p>
              </div>
              <Link href="/teachers">
                <Button variant="outline" className="gap-2 animate-slide-in-right shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm w-full sm:w-auto" data-testid="button-view-all-teachers">
                  {t("teachers.viewProfile")}
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {featuredTeachers.map((teacher, index) => (
                <div
                  key={teacher.id}
                  className="animate-fade-in-up card-hover-lift group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
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
          </div>
        </section>

        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20 animate-fade-in" aria-label="Fikrlar bo'limi">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12 animate-fade-in-up space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent px-2">
                {t("testimonials.title")}
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">{t("testimonials.subtitle")}</p>
            </div>

            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <TestimonialSlider testimonials={testimonials} />
            </div>
          </div>
        </section>

        <section className="w-full py-8 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-b from-muted/30 to-background animate-fade-in" aria-label="Tadbirlar bo'limi">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 sm:mb-8 md:mb-10 lg:mb-12 gap-4">
              <div className="animate-slide-in-left space-y-2 sm:space-y-3">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent px-2">
                  {t("events.title")}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl px-2">{t("events.subtitle")}</p>
              </div>
              <Link href="/events" className="w-full sm:w-auto px-2">
                <Button variant="outline" className="gap-2 animate-slide-in-right shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-xs sm:text-sm w-full sm:w-auto" data-testid="button-view-all-events">
                  {t("events.readMore")}
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {latestEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="animate-fade-in-up card-hover-lift group"
                  style={{ animationDelay: `${index * 0.1}s` }}
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
          </div>
        </section>

        <section className="w-full py-20 md:py-28 animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background -z-10" />
          <div className="absolute inset-0 bg-pattern-dots opacity-30 -z-10" />
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center relative z-10">
            <div className="animate-fade-in-up space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-primary">
                {ctaContent.title || t("register.title")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-1">
                {ctaContent.subtitle || t("register.subtitle")}
              </p>
              <Link href="/register" className="inline-block animate-fade-in-up stagger-2">
                <Button
                  size="lg"
                  className="gap-2 animate-scale-in-bounce shadow-xl hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 px-8 py-6 text-base hover-glow"
                  data-testid="button-cta-register"
                >
                  {ctaContent.cta || t("hero.registerBtn")}
                  <ArrowRight className="h-5 w-5 animate-pulse" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

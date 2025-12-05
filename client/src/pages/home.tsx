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
    loadData();
  }, []);

  // Structured data for SEO
  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "A+ Academy",
    "description": "A+ Academy — IT, tillar va abituriyentlar uchun zamonaviy ta'lim markazi",
    "url": typeof window !== 'undefined' ? window.location.origin : 'https://aplusacademy.uz',
    "logo": typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : 'https://aplusacademy.uz/logo.png',
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Toshkent",
      "addressCountry": "UZ"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "UZS",
      "category": "Education"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "150"
    }
  }), []);

  const loadData = async () => {
    try {
      // Load featured courses (limit 3) with teacher info
      // Avval featured va is_published filterlarsiz urinib ko'ramiz
      let coursesQuery = supabase
        .from('courses')
        .select(`
          *,
          teachers:teacher_id (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(3);
      
      const { data: coursesData, error: coursesError } = await coursesQuery;

      if (coursesError) {
        console.error('Courses error:', coursesError);
        setFeaturedCourses([]);
      } else {
        // Agar ma'lumotlar bo'lsa, featured va published filter qo'llaymiz
        const filtered = (coursesData || []).filter(course => {
          // Agar featured va is_published ustunlari mavjud bo'lsa, filter qo'llaymiz
          if (course.featured !== undefined && course.is_published !== undefined) {
            return course.featured === true && course.is_published === true;
          }
          // Agar ustunlar mavjud bo'lmasa, barchasini ko'rsatamiz
          return true;
        });
        setFeaturedCourses(filtered.slice(0, 3));
      }

      // Load featured teachers (limit 4)
      let teachersQuery = supabase
        .from('teachers')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10); // Ko'proq olish, keyin filter qilamiz
      
      const { data: teachersData, error: teachersError } = await teachersQuery;

      if (teachersError) {
        console.error('Teachers error:', teachersError);
        setFeaturedTeachers([]);
      } else {
        // Agar ma'lumotlar bo'lsa, featured filter qo'llaymiz
        const filtered = (teachersData || []).filter(teacher => {
          // Agar featured ustuni mavjud bo'lsa, filter qo'llaymiz
          if (teacher.featured !== undefined) {
            return teacher.featured === true;
          }
          // Agar ustun mavjud bo'lmasa, barchasini ko'rsatamiz
          return true;
        });
        setFeaturedTeachers(filtered.slice(0, 4));
      }

      // Load latest events (limit 3)
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
        // Agar ma'lumotlar bo'lsa, is_published filter qo'llaymiz
        const filtered = (eventsData || []).filter(event => {
          // Agar is_published ustuni mavjud bo'lsa, filter qo'llaymiz
          if (event.is_published !== undefined) {
            return event.is_published === true;
          }
          // Agar ustun mavjud bo'lmasa, barchasini ko'rsatamiz
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
              ? "Обучение в A+ Academy изменило мою жизнь. Благодаря профессиональным преподавателям и современной программе я устроился на работу мечты."
              : i18n.language === "en"
              ? "Studying at A+ Academy changed my life. Thanks to professional teachers and modern curriculum, I got my dream job."
              : "A+ Academy o'quv markazida o'qish mening hayotimni o'zgartirdi. Professional o'qituvchilar va zamonaviy dastur tufayli men orzuimdagi ishga joylashdim.",
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
          title="A+ Academy — Professional IT, IELTS & CEFR Kurslar"
          description="A+ Academy — IT, tillar va abituriyentlar uchun zamonaviy ta'lim markazi. Professional o'qituvchilar bilan yuqori natija kafolatlanadi."
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
        title="A+ Academy — Professional IT, IELTS & CEFR Kurslar"
        description="A+ Academy — IT, tillar va abituriyentlar uchun zamonaviy ta'lim markazi. Professional o'qituvchilar bilan yuqori natija kafolatlanadi."
        structuredData={structuredData}
      />
      <div className="min-h-screen">
        <Hero />
        <StatsBar />

      <section className="w-full py-20 md:py-24 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-16 gap-4">
            <div className="animate-slide-in-left space-y-3">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t("courses.title")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">{t("courses.subtitle")}</p>
            </div>
            <Link href="/courses">
              <Button variant="outline" className="gap-2 animate-slide-in-right shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105" data-testid="button-view-all-courses">
                {t("courses.filter")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCourses.map((course, index) => (
              <div key={course.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
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

      <section className="w-full py-20 md:py-24 bg-gradient-to-b from-muted/30 to-background animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-16 gap-4">
            <div className="animate-slide-in-left space-y-3">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t("teachers.title")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">{t("teachers.subtitle")}</p>
            </div>
            <Link href="/teachers">
              <Button variant="outline" className="gap-2 animate-slide-in-right shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105" data-testid="button-view-all-teachers">
                {t("teachers.viewProfile")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredTeachers.map((teacher, index) => (
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
        </div>
      </section>

      <section className="w-full py-20 md:py-24 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up space-y-3">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t("testimonials.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t("testimonials.subtitle")}</p>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <TestimonialSlider testimonials={testimonials} />
          </div>
        </div>
      </section>

      <section className="w-full py-20 md:py-24 bg-gradient-to-b from-muted/30 to-background animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 md:mb-16 gap-4">
            <div className="animate-slide-in-left space-y-3">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {t("events.title")}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl">{t("events.subtitle")}</p>
            </div>
            <Link href="/events">
              <Button variant="outline" className="gap-2 animate-slide-in-right shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105" data-testid="button-view-all-events">
                {t("events.readMore")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestEvents.map((event, index) => (
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
        </div>
      </section>

      <section className="w-full py-20 md:py-28 animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background -z-10" />
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {ctaContent.title || t("register.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {ctaContent.subtitle || t("register.subtitle")}
            </p>
            <Link href="/register">
              <Button size="lg" className="gap-2 animate-bounce-in shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8 py-6 text-base" data-testid="button-cta-register">
                {ctaContent.cta || t("hero.registerBtn")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}

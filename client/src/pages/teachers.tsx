import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TeacherCard } from "@/components/TeacherCard";
import { supabase } from "@/lib/supabase";
import type { Teacher } from "@shared/schema";
import { SEO } from "@/components/SEO";
import { GraduationCap, Users, Award, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export default function Teachers() {
  const { t, i18n } = useTranslation();
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const loadTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('status', 'active') // Faqat active o'qituvchilarni olish
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllTeachers(data || []);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Statistikalar
  const stats = useMemo(() => {
    const totalExperience = allTeachers.reduce((sum, t) => sum + (t.experience || 0), 0);
    const avgExperience = allTeachers.length > 0 ? Math.round(totalExperience / allTeachers.length) : 0;
    return {
      total: allTeachers.length,
      avgExperience,
    };
  }, [allTeachers]);

  if (loading) {
    return (
      <>
        <SEO
          title="O'qituvchilar"
          description="A+ Academy professional o'qituvchilari"
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
        title="O'qituvchilar"
        description="A+ Academy professional o'qituvchilari. 5+ yillik tajribaga ega mutaxassislar sizga eng yaxshi ta'limni berishadi."
        keywords="o'qituvchilar, A+ Academy, professional o'qituvchilar, IT o'qituvchilari, ingliz tili o'qituvchilari"
        url="/teachers"
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
                <GraduationCap className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                {t("teachers.title")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("teachers.subtitle")}
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-12 md:mb-16">
              <Card className="group relative overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 hover:shadow-xl animate-fade-in-up">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                      <p className="text-sm text-muted-foreground">Jami o'qituvchilar</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="group relative overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-secondary/50 transition-all duration-500 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 group-hover:scale-110 transition-transform duration-300">
                      <Award className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">{stats.avgExperience}+</p>
                      <p className="text-sm text-muted-foreground">O'rtacha tajriba</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="group relative overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-accent/50 transition-all duration-500 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 group-hover:scale-110 transition-transform duration-300">
                      <GraduationCap className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">{stats.avgExperience}</p>
                      <p className="text-sm text-muted-foreground">Yillik tajriba</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Teachers Carousel */}
            {allTeachers.length > 0 && (
              <div className="relative">
                <Carousel
                  setApi={setApi}
                  opts={{
                    align: "start",
                    loop: true,
                    skipSnaps: false,
                    dragFree: false,
                  }}
                  className="w-full"
                >
                  <div className="relative">
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {allTeachers.map((teacher, index) => (
                        <CarouselItem 
                          key={teacher.id}
                          className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                        >
                          <div 
                            className="h-full animate-fade-in-up hover:scale-[1.03] transition-all duration-500"
                            style={{ 
                              animationDelay: `${index * 0.1}s`,
                            }}
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
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    
                    {/* Navigation Buttons */}
                    {allTeachers.length > 4 && (
                      <>
                        <CarouselPrevious className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 shadow-lg hover:scale-110 transition-all duration-300" />
                        <CarouselNext className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/80 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/50 shadow-lg hover:scale-110 transition-all duration-300" />
                      </>
                    )}
                    
                    {/* Dots Indicator - only show if there are more teachers than can fit on screen */}
                    {allTeachers.length > 4 && (
                      <div className="flex justify-center gap-2 mt-8 flex-wrap px-4">
                        {allTeachers.slice(0, Math.min(allTeachers.length, 10)).map((_, index) => (
                          <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                              current === index
                                ? "w-8 bg-primary shadow-lg"
                                : "w-2 bg-primary/30 hover:bg-primary/50"
                            }`}
                            aria-label={`Go to teacher ${index + 1}`}
                          />
                        ))}
                        {allTeachers.length > 10 && (
                          <span className="h-2 flex items-center px-2 text-xs text-muted-foreground">
                            ...
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Carousel>
              </div>
            )}

            {/* Empty State */}
            {allTeachers.length === 0 && (
              <Card className="border-dashed border-2 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                    <Users className="w-10 h-10 text-primary/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">O'qituvchilar topilmadi</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    {t("teachers.noTeachers") || "Hozircha o'qituvchilar ro'yxati bo'sh. Tez orada qo'shiladi."}
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

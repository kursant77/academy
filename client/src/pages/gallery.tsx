import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import type { Achievement } from "@shared/schema";
import { Trophy, X, ZoomIn } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";

export default function Achievements() {
  const { t, i18n } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; studentName: string } | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchAchievements() {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && active) {
        setAchievements(data);
      }
      setLoading(false);
    }
    fetchAchievements();
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <SEO
        title="Yutuqlar va Galereya"
        description="A+ Academy o'quvchilarining yutuqlari va galereya. Bitiruvchilarimizning muvaffaqiyatlari va markaz hayoti."
        keywords="yutuqlar, galereya, A+ Academy, bitiruvchilar, muvaffaqiyatlar"
        url="/achievements"
      />
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Hero Section */}
            <div className="mb-8 sm:mb-10 md:mb-12 lg:mb-16 text-center animate-fade-in-down">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-4 sm:mb-6 backdrop-blur-sm border border-primary/20 animate-bounce-in">
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient px-2">
                {t("achievements.title")}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
                {t("achievements.subtitle")}
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground text-lg">Yuklanmoqda...</p>
              </div>
            ) : achievements.length === 0 ? (
              <Card className="border-dashed border-2 bg-card/50 backdrop-blur-sm">
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                    <Trophy className="w-10 h-10 text-primary/50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Yutuqlar topilmadi</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Hozircha yutuqlar ro'yxati bo'sh. Tez orada qo'shiladi.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {achievements.map((achievement, index) => (
                  <Card
                    key={achievement.id}
                    className="group relative overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:scale-[1.03] animate-fade-in-up"
                    style={{ 
                      animationDelay: `${index * 0.08}s`,
                      animation: `slideInUp 0.8s ease-out ${index * 0.08}s both, float 8s ease-in-out infinite ${index * 0.3}s`
                    }}
                    data-testid={`achievement-${achievement.id}`}
                  >
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0" />
                  {achievement.image_url && (
                    <div 
                      className="aspect-video w-full overflow-hidden relative group cursor-pointer"
                      onClick={() => {
                        const title = i18n.language === "ru"
                          ? achievement.title_ru
                          : i18n.language === "en"
                          ? achievement.title_en
                          : achievement.title_uz;
                        const studentName = i18n.language === "ru"
                          ? achievement.student_name_ru
                          : i18n.language === "en"
                          ? achievement.student_name_en
                          : achievement.student_name_uz;
                        setSelectedImage({
                          url: achievement.image_url!,
                          title,
                          studentName
                        });
                      }}
                    >
                      <img
                        src={achievement.image_url}
                        alt={i18n.language === "ru"
                          ? achievement.title_ru
                          : i18n.language === "en"
                          ? achievement.title_en
                          : achievement.title_uz}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          // Agar rasm yuklanmasa, fallback ko'rsatish
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<div class="aspect-video w-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center"><svg class="h-12 w-12 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg></div>';
                        }}
                      />
                      {/* Overlay with zoom icon */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-background/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                            <ZoomIn className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                    <CardHeader className="relative z-10">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-2 group-hover:scale-110 transition-transform duration-300">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {i18n.language === "ru"
                              ? achievement.title_ru
                              : i18n.language === "en"
                              ? achievement.title_en
                              : achievement.title_uz}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {i18n.language === "ru"
                              ? achievement.student_name_ru
                              : i18n.language === "en"
                              ? achievement.student_name_en
                              : achievement.student_name_uz}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <p className="text-sm text-muted-foreground">
                        {i18n.language === "ru"
                          ? achievement.description_ru
                          : i18n.language === "en"
                          ? achievement.description_en
                          : achievement.description_uz}
                      </p>
                    </CardContent>
                </Card>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-background/95 backdrop-blur-xl border-2 border-border/50">
          {selectedImage && (
            <div className="relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-background/90 backdrop-blur-sm hover:bg-destructive/10 hover:text-destructive shadow-lg"
                onClick={() => setSelectedImage(null)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </Button>

              {/* Image */}
              <div className="flex flex-col items-center justify-center p-4 sm:p-6">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
                
                {/* Image info */}
                <div className="mt-4 text-center max-w-2xl">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                    {selectedImage.title}
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {selectedImage.studentName}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

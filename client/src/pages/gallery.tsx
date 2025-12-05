import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import type { Achievement } from "@shared/schema";
import { Trophy } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function Achievements() {
  const { t, i18n } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="min-h-screen py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("achievements.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("achievements.subtitle")}</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Yuklanmoqda...</div>
        ) : achievements.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            Hozircha yutuqlar yo'q
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className="hover-elevate overflow-hidden"
                data-testid={`achievement-${achievement.id}`}
              >
                {achievement.image_url && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={achievement.image_url}
                      alt={i18n.language === "ru"
                        ? achievement.title_ru
                        : i18n.language === "en"
                        ? achievement.title_en
                        : achievement.title_uz}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        // Agar rasm yuklanmasa, fallback ko'rsatish
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="aspect-video w-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center"><svg class="h-12 w-12 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg></div>';
                      }}
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
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
                <CardContent>
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
    </>
  );
}

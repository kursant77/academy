import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Eye, Award, Users, BookOpen, TrendingUp } from "lucide-react";
import { useContent } from "@/hooks/use-content";
import { SEO } from "@/components/SEO";
import { generateOrganizationStructuredData } from "@/lib/seo-utils";

export default function About() {
  const { t, i18n } = useTranslation();
  const { content } = useContent("about", i18n.language);

  const defaultAdvantages = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      titleUz: "Tajribali o'qituvchilar",
      titleRu: "Опытные преподаватели",
      titleEn: "Experienced Teachers",
      descUz: "Barcha o'qituvchilarimiz 5+ yillik tajribaga ega professional mutaxassislar",
      descRu: "Все наши преподаватели - профессионалы с опытом более 5 лет",
      descEn: "All our teachers are professionals with 5+ years of experience",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      titleUz: "Zamonaviy dastur",
      titleRu: "Современная программа",
      titleEn: "Modern Curriculum",
      descUz: "Eng so'nggi texnologiyalar va metodlarga asoslangan o'quv dasturi",
      descRu: "Учебная программа, основанная на новейших технологиях и методах",
      descEn: "Curriculum based on latest technologies and methods",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      titleUz: "Kafolatlangan natija",
      titleRu: "Гарантированный результат",
      titleEn: "Guaranteed Results",
      descUz: "95% bitiruvchilarimiz orzuiga erishadi va ishga joylashadi",
      descRu: "95% наших выпускников достигают своих целей и трудоустраиваются",
      descEn: "95% of our graduates achieve their goals and get employed",
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      titleUz: "Rasmiy sertifikat",
      titleRu: "Официальный сертификат",
      titleEn: "Official Certificate",
      descUz: "Kursni tugatganingizdan so'ng xalqaro tan olingan sertifikat oling",
      descRu: "Получите международно признанный сертификат после завершения курса",
      descEn: "Receive internationally recognized certificate after course completion",
    },
  ];

  const advantages = defaultAdvantages.map((adv, index) => ({
    ...adv,
    titleOverride: content[`advantage_${index + 1}_title`],
    descOverride: content[`advantage_${index + 1}_desc`],
  }));

  const missionText =
    content.mission ??
    (i18n.language === "ru"
      ? "Наша цель - предоставить каждому студенту качественное образование и внести вклад в их профессиональное развитие. Мы готовим молодежь к будущему с помощью современных технологий и опытных преподавателей."
      : i18n.language === "en"
      ? "Our mission is to provide quality education to every student and contribute to their professional development. We prepare youth for the future with modern technologies and experienced teachers."
      : "Biz har bir talabaga sifatli ta'lim berib, ularning professional rivojlanishiga hissa qo'shishni maqsad qilganmiz. Zamonaviy texnologiyalar va tajribali o'qituvchilar yordamida yoshlarni kelajakka tayyorlaymiz.");

  const visionText =
    content.vision ??
    (i18n.language === "ru"
      ? "Стать ведущим и инновационным учебным центром в Узбекистане. К 2030 году подготовить 10,000+ профессиональных специалистов и обеспечить образование, соответствующее международным стандартам."
      : i18n.language === "en"
      ? "To become the leading and most innovative learning center in Uzbekistan. By 2030, train 10,000+ professional specialists and provide education that meets international standards."
      : "O'zbekistondagi eng yetakchi va innovatsion o'quv markazi bo'lish. 2030 yilga kelib 10,000+ professional mutaxassislarni tayyorlash va xalqaro standartlarga mos ta'lim berish.");

  const historyText =
    content.history ??
    (i18n.language === "ru"
      ? "Учебный центр IELTS Imperia был основан в 2012 году. Сегодня 2500+ студентов обучаются у нас, а более 1800 выпускников уже построили карьеру в международных компаниях."
      : i18n.language === "en"
      ? "IELTS Imperia was founded in 2012. Today 2500+ students study with us and 1800+ graduates have already built careers in international companies."
      : "IELTS Imperia 2012 yilda tashkil topgan. Bugun 2500+ talaba biz bilan tahsil olmoqda va 1800+ bitiruvchi xalqaro kompaniyalarda faoliyat yuritmoqda.");

  const structuredData = generateOrganizationStructuredData();

  return (
    <>
      <SEO
        title="Biz Haqimizda — IELTS Imperia | Toshkent O'quv Markazi | 2012 yildan"
        description="IELTS Imperia — 2012 yildan beri IT, tillar va abituriyentlar uchun zamonaviy ta'lim markazi. 2500+ talaba, 1800+ bitiruvchi, professional o'qituvchilar. Toshkent. Batafsil ma'lumot."
        keywords="IELTS Imperia, ta'lim markazi, Toshkent o'quv markazi, IT kurslar, ingliz tili, IELTS, CEFR, o'quv markazi, 2012 yildan, professional ta'lim, zamonaviy ta'lim, Toshkent, o'quv markazi haqida, ta'lim markazi haqida"
        url="/about"
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
                <Target className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient px-2" style={{ height: '70px' }}>
                {t("about.title")}
              </h1>
            </div>

            {/* Mission & Vision Cards */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12 lg:mb-16">
              <Card className="group relative overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 hover:shadow-xl animate-fade-in-up">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:scale-110 transition-transform duration-300">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{t("about.mission")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-muted-foreground leading-relaxed">
                    {missionText}
                  </p>
                </CardContent>
              </Card>

              <Card className="group relative overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-secondary/50 transition-all duration-500 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10 group-hover:scale-110 transition-transform duration-300">
                      <Eye className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <CardTitle className="text-2xl">{t("about.vision")}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-muted-foreground leading-relaxed">
                    {visionText}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Advantages Section */}
            <div className="mb-8 sm:mb-10 md:mb-12 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-2">{t("about.advantages")}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {advantages.map((advantage, index) => (
                  <Card 
                    key={index} 
                    className="group relative overflow-hidden text-center border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 hover:shadow-xl animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="relative pt-6 space-y-4">
                      <div className="flex justify-center">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 group-hover:scale-110 transition-transform duration-300">
                          {advantage.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          {advantage.titleOverride
                            ? advantage.titleOverride
                            : i18n.language === "ru"
                            ? advantage.titleRu
                            : i18n.language === "en"
                            ? advantage.titleEn
                            : advantage.titleUz}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {advantage.descOverride
                            ? advantage.descOverride
                            : i18n.language === "ru"
                            ? advantage.descRu
                            : i18n.language === "en"
                            ? advantage.descEn
                            : advantage.descUz}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* History Section */}
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-2">{t("about.history")}</h2>
              <Card className="group relative overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm hover:border-accent/50 transition-all duration-500 hover:shadow-xl animate-fade-in-up">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="relative pt-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {historyText}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

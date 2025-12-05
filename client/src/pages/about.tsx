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
      ? "Учебный центр A+ Academy был основан в 2012 году. Сегодня 2500+ студентов обучаются у нас, а более 1800 выпускников уже построили карьеру в международных компаниях."
      : i18n.language === "en"
      ? "A+ Academy was founded in 2012. Today 2500+ students study with us and 1800+ graduates have already built careers in international companies."
      : "A+ Academy 2012 yilda tashkil topgan. Bugun 2500+ talaba biz bilan tahsil olmoqda va 1800+ bitiruvchi xalqaro kompaniyalarda faoliyat yuritmoqda.");

  const structuredData = generateOrganizationStructuredData();

  return (
    <>
      <SEO
        title="Biz haqimizda"
        description="A+ Academy — 2012 yildan beri IT, tillar va abituriyentlar uchun zamonaviy ta'lim markazi. 2500+ talaba, 1800+ bitiruvchi, professional o'qituvchilar."
        keywords="A+ Academy, ta'lim markazi, Toshkent, IT kurslar, ingliz tili, IELTS, CEFR, o'quv markazi"
        url="/about"
        structuredData={structuredData}
      />
      <div className="min-h-screen py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("about.title")}</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{t("about.mission")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {missionText}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{t("about.vision")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {visionText}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">{t("about.advantages")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {advantages.map((advantage, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-center">
                      <div className="p-3 rounded-lg bg-primary/10">
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

          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">{t("about.history")}</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  {historyText}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

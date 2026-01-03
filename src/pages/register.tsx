import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useContent } from "@/hooks/use-content";
import { supabase } from "@/lib/supabase";
import { sendTelegramMessage, formatRegistrationMessage } from "@/lib/telegram";
import type { Course } from "@shared/schema";
import { SEO } from "@/components/SEO";
import {
  User,
  Phone,
  Calendar,
  BookOpen,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
  GraduationCap
} from "lucide-react";

export default function Register() {
  const { t, i18n } = useTranslation();
  const { toast, dismiss } = useToast();
  const { content: contactContent } = useContent("contact", i18n.language);
  const { content: socialContent } = useContent("social", i18n.language);
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    phone: "",
    parentPhone: "",
    courseId: "",
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const isSubmittingRef = useRef(false);
  const toastShownRef = useRef(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) {
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            // Courses jadvali topilmadi
          }
          setCourses([]);
        } else if (data) {
          setCourses(data || []);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (import.meta.env.DEV) {
          console.error('Registration error:', errorMessage);
        }
        toast({
          title: t("register.error") || "Xatolik",
          description: error.message || "Ma'lumotlar yuklanmadi",
          variant: "destructive",
        });
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Agar allaqachon submitting bo'lsa, qaytaramiz
    if (submitting || isSubmittingRef.current) {
      return;
    }

    isSubmittingRef.current = true;

    if (!formData.courseId) {
      toast({
        title: t("register.error") || "Xatolik",
        description: t("register.selectCourse"),
        variant: "destructive",
      });
      return;
    }

    if (!formData.fullName.trim()) {
      toast({
        title: t("register.error") || "Xatolik",
        description: t("register.fullName") + " to'ldirilishi shart",
        variant: "destructive",
      });
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: t("register.error") || "Xatolik",
        description: t("register.phone") + " to'ldirilishi shart",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.age ||
      Number(formData.age) < 10 ||
      Number(formData.age) > 100
    ) {
      toast({
        title: t("register.error") || "Xatolik",
        description: t("register.age") + " 10 va 100 orasida bo'lishi kerak",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const selectedCourse = courses.find((c) => c.id === formData.courseId);
      const courseName = selectedCourse
        ? i18n.language === "uz"
          ? selectedCourse.name_uz
          : i18n.language === "ru"
            ? selectedCourse.name_ru
            : selectedCourse.name_en
        : "Kurs";

      // Telegram botga xabar yuborish (Backend/Supabase ga bog'liq emas)
      const telegramMessage = formatRegistrationMessage({
        fullName: formData.fullName.trim(),
        age: formData.age,
        phone: formData.phone.trim(),
        courseName: courseName,
        parentPhone: formData.parentPhone.trim() || undefined,
      });

      // Parallel ravishda bajarish: Telegram va Database
      const [telegramResult, dbResult] = await Promise.allSettled([
        sendTelegramMessage(telegramMessage),
        supabase.from("applications").insert({
          full_name: formData.fullName.trim(),
          age: Number(formData.age),
          phone: formData.phone.trim(),
          course_id: formData.courseId || null,
          category_id: null,
          interests: `Kursga yozilish: ${courseName}`,
          status: "pending",
          data: {
            locale: i18n.language,
            parent_phone: formData.parentPhone.trim() || null,
          },
        })
      ]);

      // Database xatoligini tekshirish (agar kerak bo'lsa)
      if (dbResult.status === 'rejected' || (dbResult.status === 'fulfilled' && dbResult.value.error)) {
        const error = dbResult.status === 'rejected' ? dbResult.reason : dbResult.value.error;
        console.warn("Database save error (non-blocking):", error);
        // Supabase xatosi endi jarayonni to'xtatmaydi, chunki asosiy maqsad Telegram
      }

      // Telegram xatoligini tekshirish
      if (telegramResult.status === 'rejected' || (telegramResult.status === 'fulfilled' && !telegramResult.value)) {
        console.warn("Telegram send warning: Message might not have been sent");
      }

      setSuccess(true);

      // Toast faqat bitta marta ko'rsatilishi uchun
      if (!toastShownRef.current) {
        toastShownRef.current = true;

        // Barcha ochiq toast'larni yopish
        dismiss();

        // Kichik delay bilan yangi toast ko'rsatish (barcha toast'lar yopilishi uchun)
        setTimeout(() => {
          toast({
            title: t("register.success") || "Arizangiz yuborildi! Tez orada siz bilan bog'lanamiz.",
          });
        }, 100);

        // 3 soniyadan keyin toastShownRef'ni reset qilish
        setTimeout(() => {
          toastShownRef.current = false;
        }, 3000);
      }

      setTimeout(() => {
        setFormData({
          fullName: "",
          age: "",
          phone: "",
          courseId: "",
          parentPhone: "",
        });
        setSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: t("register.error") || "Xatolik",
        description:
          error.message || "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <>
      <SEO
        title="Ro'yxatdan O'tish — IELTS Imperia | Kursga Yozilish Toshkent"
        description="IELTS Imperia kurslariga ro'yxatdan o'ting. IT, IELTS, CEFR va dasturlash kurslari. Professional o'qituvchilar bilan sifatli ta'lim. Toshkent. Tezkor ro'yxatdan o'tish!"
        keywords="ro'yxatdan o'tish, kursga yozilish, IELTS Imperia, IT kurslar, IELTS, CEFR, dasturlash kurslariga yozilish, Toshkent kurslar, o'quv markaziga yozilish, online ro'yxatdan o'tish"
        url="/register"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Ro'yxatdan O'tish - IELTS Imperia",
          "description": "IELTS Imperia kurslariga ro'yxatdan o'tish",
          "potentialAction": {
            "@type": "RegisterAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://ieltsimperia.uz/register"
            }
          }
        }}
      />
      <div className="relative min-h-screen py-8 sm:py-12 md:py-16 lg:py-20 overflow-hidden">
        {/* Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] -z-10" />
        <div className="absolute inset-0 bg-pattern-dots opacity-20 -z-10" />

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse -z-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl animate-float -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
          {/* Header Section */}
          <div className="mb-8 sm:mb-10 md:mb-12 text-center space-y-3 sm:space-y-4 animate-fade-in-down">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 mb-3 sm:mb-4">
              <GraduationCap className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent px-2">
              {t("register.title") || "Ro'yxatdan o'tish"}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              {t("register.subtitle") || "IELTS Imperia kurslariga ro'yxatdan o'ting va professional ta'lim oling"}
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mt-6 sm:mt-8 px-2">
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Professional o'qituvchilar</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-accent/10 text-accent-foreground text-xs sm:text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Zamonaviy dasturlar</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Tez natijalar</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-6 sm:gap-8 items-start">
            {/* Main Form Card */}
            <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95 animate-fade-in card-hover-lift order-2 lg:order-1">
              <CardHeader className="space-y-1 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <CardTitle className="text-xl sm:text-2xl">Ma'lumotlarni kiriting</CardTitle>
                </div>
                <CardDescription className="text-sm sm:text-base">
                  Barcha maydonlarni to'ldiring va arizangizni yuboring
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                {success ? (
                  <div className="text-center py-8 sm:py-12 space-y-3 sm:space-y-4 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-500/10">
                      <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-emerald-600">
                      Muvaffaqiyatli yuborildi!
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground px-2">
                      Arizangiz qabul qilindi. Tez orada siz bilan bog'lanamiz.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2">
                        <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                        {t("register.fullName") || "To'liq ism"}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        placeholder="Masalan: Aliyev Vali"
                        required
                        className="h-11 sm:h-12 text-sm sm:text-base"
                        data-testid="input-fullname"
                      />
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                        {t("register.age") || "Yosh"}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="number"
                        value={formData.age}
                        onChange={(e) =>
                          setFormData({ ...formData, age: e.target.value })
                        }
                        placeholder="Masalan: 18"
                        required
                        min="10"
                        max="100"
                        className="h-11 sm:h-12 text-sm sm:text-base"
                        data-testid="input-age"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        {t("register.phone") || "Telefon raqami"}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+998 90 123 45 67"
                        required
                        className="h-11 sm:h-12 text-sm sm:text-base"
                        data-testid="input-phone"
                      />
                    </div>

                    {/* Parent Phone */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                        Ota-ona telefon raqami
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        type="tel"
                        value={formData.parentPhone}
                        onChange={(e) =>
                          setFormData({ ...formData, parentPhone: e.target.value })
                        }
                        placeholder="+998 90 123 45 67"
                        required
                        className="h-11 sm:h-12 text-sm sm:text-base"
                        data-testid="input-parent-phone"
                      />
                    </div>

                    {/* Course Selection */}
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2">
                        <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                        {t("register.selectCourse") || "Kursni tanlang"}
                        <span className="text-destructive">*</span>
                      </label>
                      <Select
                        value={formData.courseId}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            courseId: value === "none" ? "" : value,
                          })
                        }
                      >
                        <SelectTrigger className="h-12 text-base" data-testid="select-course">
                          <SelectValue placeholder="Kursni tanlang..." />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingOptions ? (
                            <SelectItem value="loading" disabled>
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t("common.loading") || "Yuklanmoqda..."}
                              </div>
                            </SelectItem>
                          ) : courses.length === 0 ? (
                            <SelectItem value="no-courses" disabled>
                              {t("courses.noCourses") || "Kurslar topilmadi"}
                            </SelectItem>
                          ) : (
                            courses.map((course) => (
                              <SelectItem key={course.id} value={course.id}>
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4" />
                                  {i18n.language === "uz"
                                    ? course.name_uz
                                    : i18n.language === "ru"
                                      ? course.name_ru
                                      : course.name_en}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold group"
                      data-testid="button-submit"
                      disabled={submitting || loadingOptions}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          {t("register.loading") || "Yuborilmoqda..."}
                        </>
                      ) : (
                        <>
                          {t("register.submit") || "Arizani yuborish"}
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Arizangizni yuborish orqali siz{" "}
                      <span className="underline">shartlar</span> va{" "}
                      <span className="underline">maxfiylik siyosati</span>ga rozilik bildirasiz
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Side Info Card */}
            <div className="space-y-6 animate-fade-in-up order-1 lg:order-2">
              <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Nima uchun IELTS Imperia?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Professional o'qituvchilar</h4>
                      <p className="text-sm text-muted-foreground">
                        Sertifikatlangan va tajribali mutaxassislar
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Zamonaviy usullar</h4>
                      <p className="text-sm text-muted-foreground">
                        Eng yangi dasturlar va texnologiyalar
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Tez natijalar</h4>
                      <p className="text-sm text-muted-foreground">
                        Qisqa muddatda yuqori natijalar
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Qulay jadval</h4>
                      <p className="text-sm text-muted-foreground">
                        O'z vaqtingizga moslashgan darslar
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle>Yordam kerakmi?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Savollaringiz bormi? Bizning jamoamizga murojaat qiling
                  </p>
                  <div className="flex flex-col gap-2">
                    {contactContent.phone && (
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => window.open(`tel:${contactContent.phone?.replace(/\s/g, '')}`, '_self')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {contactContent.phone}
                      </Button>
                    )}
                    {socialContent.telegram && (
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => window.open(socialContent.telegram as string, '_blank')}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Telegram kanal
                      </Button>
                    )}
                    {!contactContent.phone && !socialContent.telegram && (
                      <p className="text-xs text-muted-foreground italic">
                        Ma'lumotlar admin panelda sozlanadi
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

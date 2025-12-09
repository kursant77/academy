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
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    phone: "",
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
      } catch (error: any) {
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

      const { error: appError } = await supabase.from("applications").insert({
        full_name: formData.fullName.trim(),
        age: Number(formData.age),
        phone: formData.phone.trim(),
        course_id: formData.courseId || null,
        category_id: null,
        interests: `Kursga yozilish: ${courseName}`,
        status: "pending",
        data: {
          locale: i18n.language,
        },
      });

      if (appError) {
        console.error("Application insert error:", appError);
        throw appError;
      }

      // Telegram botga xabar yuborish
      const telegramMessage = formatRegistrationMessage({
        fullName: formData.fullName.trim(),
        age: formData.age,
        phone: formData.phone.trim(),
        courseName: courseName,
      });
      
      sendTelegramMessage(telegramMessage).catch((err) => {
        console.warn('Telegram xabar yuborilmadi:', err);
      });

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
        title="Ro'yxatdan o'tish"
        description="A+ Academy kurslariga ro'yxatdan o'ting. IT, IELTS, CEFR va boshqa kurslar. Professional o'qituvchilar bilan sifatli ta'lim."
        keywords="ro'yxatdan o'tish, kursga yozilish, A+ Academy, IT kurslar, IELTS, CEFR"
        url="/register"
      />
      <div className="relative min-h-screen py-12 md:py-20 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] -z-10" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse -z-10" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000 -z-10" />

        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
          {/* Header Section */}
          <div className="mb-12 text-center space-y-4 animate-fade-in-down">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
              <GraduationCap className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              {t("register.title") || "Ro'yxatdan o'tish"}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("register.subtitle") || "A+ Academy kurslariga ro'yxatdan o'ting va professional ta'lim oling"}
            </p>
            
            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Professional o'qituvchilar</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent-foreground text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zamonaviy dasturlar</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tez natijalar</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-[1fr_400px] gap-8 items-start">
            {/* Main Form Card */}
            <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95 animate-fade-in">
              <CardHeader className="space-y-1 pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <CardTitle className="text-2xl">Ma'lumotlarni kiriting</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Barcha maydonlarni to'ldiring va arizangizni yuboring
                </CardDescription>
              </CardHeader>
              <CardContent>
                {success ? (
                  <div className="text-center py-12 space-y-4 animate-fade-in">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-600">
                      Muvaffaqiyatli yuborildi!
                    </h3>
                    <p className="text-muted-foreground">
                      Arizangiz qabul qilindi. Tez orada siz bilan bog'lanamiz.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
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
                        className="h-12 text-base"
                        data-testid="input-fullname"
                      />
                    </div>

                    {/* Age */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
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
                        className="h-12 text-base"
                        data-testid="input-age"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
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
                        className="h-12 text-base"
                        data-testid="input-phone"
                      />
                    </div>

                    {/* Course Selection */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
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
            <div className="space-y-6 animate-fade-in-up">
              <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Nima uchun A+ Academy?
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
                    <Button variant="outline" className="justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      +998 XX XXX XX XX
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Phone className="w-4 h-4 mr-2" />
                      Telegram kanal
                    </Button>
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

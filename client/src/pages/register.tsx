import { useEffect, useState } from "react";
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

export default function Register() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    phone: "",
    courseId: "",
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        console.log("Kurslarni yuklash boshlandi...");
        
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .order("created_at", { ascending: false });

        console.log("Kurslar response:", { data, error });

        if (error) {
          console.error("Failed to load courses:", error);
          // Agar jadval topilmasa yoki CORS xatosi bo'lsa
          if (error.code === '42P01' || error.message?.includes('does not exist')) {
            console.warn("Courses jadvali topilmadi. Database setup qiling.");
          }
          setCourses([]);
        } else if (data) {
          console.log(`${data.length} ta kurs topildi`);
          // Client-side filter: agar is_published ustuni mavjud bo'lsa, filter qo'llaymiz
          const filtered = data.filter((course) => {
            if (course.is_published !== undefined) {
              return course.is_published === true;
            }
            return true; // Agar ustun mavjud bo'lmasa, barchasini ko'rsatamiz
          });
          console.log(`${filtered.length} ta published kurs`);
          setCourses(filtered);
        }
      } catch (error: any) {
        console.error("Failed to load options", error);
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
      
      // Xabarni yuborish (xatolik bo'lsa ham forma muvaffaqiyatli)
      sendTelegramMessage(telegramMessage).catch((err) => {
        console.warn('Telegram xabar yuborilmadi:', err);
      });

      toast({
        title: t("register.success"),
        description: t("register.success"),
      });

      setFormData({
        fullName: "",
        age: "",
        phone: "",
        courseId: "",
      });
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
      <div className="min-h-screen py-12 md:py-16">
        <div className="max-w-2xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t("register.title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("register.subtitle")}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("register.title")}</CardTitle>
              <CardDescription>{t("register.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("register.fullName")}
                  </label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder={t("register.fullName")}
                    required
                    data-testid="input-fullname"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("register.age")}
                  </label>
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    placeholder={t("register.age")}
                    required
                    min="10"
                    max="100"
                    data-testid="input-age"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("register.phone")}
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+998 90 123 45 67"
                    required
                    data-testid="input-phone"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("register.selectCourse")}
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
                    <SelectTrigger data-testid="select-course">
                      <SelectValue placeholder={t("register.selectCourse")} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingOptions ? (
                        <SelectItem value="loading" disabled>
                          {t("common.loading") || "Yuklanmoqda..."}
                        </SelectItem>
                      ) : courses.length === 0 ? (
                        <SelectItem value="no-courses" disabled>
                          {t("courses.noCourses") || "Kurslar topilmadi"}
                        </SelectItem>
                      ) : (
                        courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {i18n.language === "uz"
                              ? course.name_uz
                              : i18n.language === "ru"
                              ? course.name_ru
                              : course.name_en}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  data-testid="button-submit"
                  disabled={submitting || loadingOptions}
                >
                  {submitting
                    ? t("register.loading") || "Yuborilmoqda..."
                    : t("register.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

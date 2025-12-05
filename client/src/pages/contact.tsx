import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useContent } from "@/hooks/use-content";
import { supabase } from "@/lib/supabase";
import { SEO } from "@/components/SEO";

export default function Contact() {
  const { t, i18n } = useTranslation();
  const { content } = useContent("contact", i18n.language);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: t("register.error") || "Xatolik",
        description: "Iltimos, barcha maydonlarni to'ldiring",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Contact message ni database'ga saqlash (trigger avtomatik Telegram xabar yuboradi)
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        });

      if (dbError) {
        console.error("Contact message saqlashda xatolik:", dbError);
        throw dbError;
      }

      // Database trigger avtomatik Telegram xabar yuboradi
      // (TELEGRAM_TRIGGER_SQL.sql faylida sozlangan)

      toast({
        title: t("contact.send"),
        description: t("register.success") || "Xabaringiz muvaffaqiyatli yuborildi!",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      console.error("Contact form submission error:", error);
      toast({
        title: t("register.error") || "Xatolik",
        description: error.message || "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Bog'lanish"
        description="A+ Academy bilan bog'laning. Manzil, telefon, email va ish vaqtlari. Savollaringiz bo'lsa, bizga yozing."
        keywords="bog'lanish, A+ Academy, telefon, email, manzil, Toshkent"
        url="/contact"
      />
      <div className="min-h-screen py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="mb-8 md:mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("contact.title")}</h1>
            <p className="text-lg text-muted-foreground">{t("contact.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("contact.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{t("contact.address")}</div>
                      <div className="text-sm text-muted-foreground">
                        {content.address || "Tashkent, Chilonzor district, Bunyodkor Avenue 12"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{t("contact.phone")}</div>
                      <div className="text-sm text-muted-foreground">
                        {content.phone || "+998 90 123 45 67"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{t("contact.email")}</div>
                      <div className="text-sm text-muted-foreground">
                        {content.email || "info@aplus.uz"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <div className="font-medium">{t("contact.workHours")}</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>{content.hours_week || `${t("contact.mondayFriday")}: 09:00 - 18:00`}</div>
                        <div>{content.hours_sat || `${t("contact.saturday")}: 09:00 - 14:00`}</div>
                        <div>{content.hours_sun || t("contact.sunday")}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="font-medium mb-3">{t("footer.followUs")}</div>
                    <div className="flex gap-2">
                      {content.facebook && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(content.facebook as string, "_blank")}
                          data-testid="button-contact-facebook"
                        >
                          <Facebook className="h-4 w-4" />
                        </Button>
                      )}
                      {content.instagram && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(content.instagram as string, "_blank")}
                          data-testid="button-contact-instagram"
                        >
                          <Instagram className="h-4 w-4" />
                        </Button>
                      )}
                      {content.telegram && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(content.telegram as string, "_blank")}
                          data-testid="button-contact-telegram"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <div className="h-64 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MapPin className="h-12 w-12 text-primary/50 mx-auto" />
                    <p className="text-sm text-muted-foreground">Google Maps Integration</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t("contact.message")}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("contact.name")}</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t("contact.name")}
                      required
                      data-testid="input-contact-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("contact.email")}</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t("contact.email")}
                      required
                      data-testid="input-contact-email"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("contact.message")}</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t("contact.message")}
                      rows={6}
                      required
                      data-testid="input-contact-message"
                    />
                  </div>

                  <Button type="submit" className="w-full" data-testid="button-contact-submit" disabled={submitting}>
                    {submitting ? (t("register.loading") || "Yuborilmoqda...") : t("contact.send")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

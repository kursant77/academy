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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Contact form error:', errorMessage);
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
        title="Bog'lanish — A+ Academy | Telefon, Email, Manzil Toshkent"
        description="A+ Academy bilan bog'laning. Manzil: Toshkent, Bunyodkor Avenue 12. Telefon, email va ish vaqtlari. Savollaringiz bo'lsa, bizga yozing!"
        keywords="bog'lanish, A+ Academy, telefon, email, manzil, Toshkent, aloqa, kontakt, telefon raqam, email manzil, manzil Toshkent, o'quv markazi manzili"
        url="/contact"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "A+ Academy - Bog'lanish",
          "description": "A+ Academy bilan bog'lanish",
          "mainEntity": {
            "@type": "Organization",
            "name": "A+ Academy",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Bunyodkor Avenue 12",
              "addressLocality": "Toshkent",
              "addressCountry": "UZ"
            },
            "telephone": "+998901234567",
            "email": "info@aplusacademy.uz"
          }
        }}
      />
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl animate-float" />
          <div className="absolute inset-0 bg-pattern-dots opacity-20" />
        </div>

        <div className="relative py-8 sm:py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Hero Section */}
            <div className="mb-6 sm:mb-8 md:mb-10 text-center animate-fade-in-down">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-4 sm:mb-6 backdrop-blur-sm border border-primary/20 animate-bounce-in shadow-lg">
                <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                {t("contact.title")}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("contact.subtitle")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4 sm:space-y-5">
                <Card className="group relative overflow-hidden border-2 border-border/50 bg-card/80 backdrop-blur-md hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 animate-fade-in-up shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <CardHeader className="relative pb-3">
                    <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {t("contact.title")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-4 sm:space-y-5">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-300 group/item">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors duration-300">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm sm:text-base mb-1">{t("contact.address")}</div>
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {content.address || "Tashkent, Chilonzor district, Bunyodkor Avenue 12"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-300 group/item">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors duration-300">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm sm:text-base mb-1">{t("contact.phone")}</div>
                      <a href={`tel:${content.phone?.replace(/\s/g, '') || '+998901234567'}`} className="text-sm text-primary hover:text-primary/80 transition-colors duration-300">
                        {content.phone || "+998 90 123 45 67"}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-300 group/item">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors duration-300">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm sm:text-base mb-1">{t("contact.email")}</div>
                      <a href={`mailto:${content.email || 'info@aplus.uz'}`} className="text-sm text-primary hover:text-primary/80 transition-colors duration-300 break-all">
                        {content.email || "info@aplus.uz"}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-300 group/item">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors duration-300">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm sm:text-base mb-1">{t("contact.workHours")}</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>{content.hours_week || `${t("contact.mondayFriday")}: 09:00 - 18:00`}</div>
                        <div>{content.hours_sat || `${t("contact.saturday")}: 09:00 - 14:00`}</div>
                        <div>{content.hours_sun || t("contact.sunday")}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="font-semibold text-sm sm:text-base mb-3">{t("footer.followUs")}</div>
                    <div className="flex gap-2 sm:gap-3">
                      {content.facebook && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(content.facebook as string, "_blank")}
                          data-testid="button-contact-facebook"
                          className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-110"
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
                          className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-110"
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
                          className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-110"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

                <Card className="overflow-hidden border-2 border-border/50 bg-card/80 backdrop-blur-md hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 animate-fade-in-up shadow-lg" style={{ animationDelay: '0.1s' }}>
                  <div className="h-56 sm:h-64 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="text-center space-y-3 relative z-10">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors duration-300 mb-2">
                        <MapPin className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-sm sm:text-base font-medium text-muted-foreground">Google Maps Integration</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="group relative overflow-hidden border-2 border-border/50 bg-card/80 backdrop-blur-md hover:border-secondary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/10 animate-fade-in-up shadow-lg" style={{ animationDelay: '0.2s' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-secondary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                    {t("contact.message")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">{t("contact.name")}</label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t("contact.name")}
                        required
                        data-testid="input-contact-name"
                        className="h-11 bg-background/50 border-2 focus:border-primary transition-colors duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold">{t("contact.email")}</label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t("contact.email")}
                        required
                        data-testid="input-contact-email"
                        className="h-11 bg-background/50 border-2 focus:border-primary transition-colors duration-300"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold">{t("contact.message")}</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t("contact.message")}
                        rows={5}
                        required
                        data-testid="input-contact-message"
                        className="bg-background/50 border-2 focus:border-primary transition-colors duration-300 resize-none"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" 
                      data-testid="button-contact-submit" 
                      disabled={submitting}
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin">⏳</span>
                          {t("register.loading") || "Yuborilmoqda..."}
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          {t("contact.send")}
                        </span>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

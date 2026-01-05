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
import { sendTelegramMessage, formatContactMessage } from "@/lib/telegram";
import { SEO } from "@/components/SEO";

export default function Contact() {
  const { t, i18n } = useTranslation();
  const { content } = useContent("contact", i18n.language);
  const { content: socialContent } = useContent("social", i18n.language);
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
      // Telegram botga xabar yuborish (frontend'dan to'g'ridan-to'g'ri)
      const telegramMessage = formatContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });

      // Parallel ravishda bajarish: Telegram va Database
      const [telegramResult, dbResult] = await Promise.allSettled([
        sendTelegramMessage(telegramMessage),
        supabase
          .from('contact_messages')
          .insert({
            name: formData.name.trim(),
            email: formData.email.trim(),
            message: formData.message.trim(),
          })
      ]);

      // DB xatosi bo'lsa ham davom etamiz (log qilamiz)
      if (dbResult.status === 'rejected' || (dbResult.status === 'fulfilled' && dbResult.value.error)) {
        console.warn("Contact DB save error:", dbResult.status === 'rejected' ? dbResult.reason : dbResult.value.error);
      }

      toast({
        title: t("contact.send"),
        description: t("register.success") || "Xabaringiz muvaffaqiyatli yuborildi!",
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (import.meta.env.DEV) {
        console.error('Contact form error:', errorMessage);
      }
      toast({
        title: t("register.error") || "Xatolik",
        description: errorMessage || "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title="Bog'lanish — IELTS Imperia | Telefon, Email, Manzil Toshkent"
        description="IELTS Imperia bilan bog'laning. Manzil: Toshkent, Bunyodkor Avenue 12. Telefon, email va ish vaqtlari. Savollaringiz bo'lsa, bizga yozing!"
        keywords="bog'lanish, IELTS Imperia, telefon, email, manzil, Toshkent, aloqa, kontakt, telefon raqam, email manzil, manzil Toshkent, o'quv markazi manzili"
        url="/contact"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "IELTS Imperia - Bog'lanish",
          "description": "IELTS Imperia bilan bog'lanish",
          "mainEntity": {
            "@type": "Organization",
            "name": "IELTS Imperia",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Bunyodkor Avenue 12",
              "addressLocality": "Toshkent",
              "addressCountry": "UZ"
            },
            "telephone": "+998901234567",
            "email": "info@ieltsimperia.uz"
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
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient" style={{ height: '58px' }}>
                {t("contact.title")}
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                {t("contact.subtitle")}
              </p>
            </div>

            {/* Tepada: Xabar formasi va Biz bilan bog'lanish bir row'da */}
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Biz bilan bog'lanish card */}
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
                    <div className="p-2 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors duration-300 flex-shrink-0">
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
                    <div className="p-2 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors duration-300 flex-shrink-0">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm sm:text-base mb-1">{t("contact.phone")}</div>
                      <a href={`tel:${content.phone?.replace(/\s/g, '') || '+998901234567'}`} className="text-sm text-primary hover:text-primary/80 transition-colors duration-300 break-all">
                        {content.phone || "+998 90 123 45 67"}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors duration-300 group/item">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors duration-300 flex-shrink-0">
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
                    <div className="p-2 rounded-lg bg-primary/10 group-hover/item:bg-primary/20 transition-colors duration-300 flex-shrink-0">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm sm:text-base mb-1">{t("contact.workHours")}</div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>{t("contact.mondayFriday")}: {content.hours_week || "09:00 - 18:00"}</div>
                        <div>{t("contact.saturday")}: {content.hours_sat || "09:00 - 14:00"}</div>
                        <div>{t("contact.sunday")}: {content.hours_sun || t("contact.sunday")}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="font-semibold text-sm sm:text-base mb-3">{t("footer.followUs")}</div>
                    <div className="flex gap-2 sm:gap-3 flex-wrap">
                      {socialContent.facebook && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(socialContent.facebook as string, "_blank")}
                          data-testid="button-contact-facebook"
                          className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-110"
                        >
                          <Facebook className="h-4 w-4" />
                        </Button>
                      )}
                      {socialContent.instagram && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(socialContent.instagram as string, "_blank")}
                          data-testid="button-contact-instagram"
                          className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-110"
                        >
                          <Instagram className="h-4 w-4" />
                        </Button>
                      )}
                      {socialContent.telegram && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(socialContent.telegram as string, "_blank")}
                          data-testid="button-contact-telegram"
                          className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-110"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {socialContent.youtube && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(socialContent.youtube as string, "_blank")}
                          data-testid="button-contact-youtube"
                          className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-110"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                        </Button>
                      )}
                      {socialContent.linkedin && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(socialContent.linkedin as string, "_blank")}
                          data-testid="button-contact-linkedin"
                          className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-110"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </Button>
                      )}
                      {socialContent.twitter && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(socialContent.twitter as string, "_blank")}
                          data-testid="button-contact-twitter"
                          className="hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 hover:scale-110"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        </Button>
                      )}
                      {(!socialContent.facebook && !socialContent.instagram && !socialContent.telegram && !socialContent.youtube && !socialContent.linkedin && !socialContent.twitter) && (
                        <div className="text-xs text-muted-foreground italic">
                          Ishtimoiy tarmoqlar admin panelda sozlanadi
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Xabar yuborish formasi */}
              <Card className="group relative overflow-hidden border-2 border-border/50 bg-card/80 backdrop-blur-md hover:border-secondary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-secondary/10 animate-fade-in-up shadow-lg" style={{ animationDelay: '0.1s' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-secondary/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute top-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <CardHeader className="relative pb-3">
                  <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient" style={{ marginTop: '10px', marginBottom: '10px' }}>
                    {t("contact.message")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div className="space-y-2" style={{ marginTop: '0px', marginBottom: '0px' }}>
                      <label className="text-sm font-semibold">{t("contact.message")}</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder={t("contact.message")}
                        rows={5}
                        required
                        data-testid="input-contact-message"
                        className="min-h-[132px] bg-background/50 border-2 focus:border-primary transition-colors duration-300 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      data-testid="button-contact-submit"
                      disabled={submitting}
                      style={{ marginTop: '35px' }}
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

            {/* Pastda: Faqat map */}
            <Card className="overflow-hidden border-2 border-border/50 bg-card/80 backdrop-blur-md hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 animate-fade-in-up shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.75494098447!2d60.6263514!3d41.553519900000005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x41dfc98567b6c0cf%3A0xae5b34fc2f13cb5d!2sIELTS%20Imperia%20learning%20center!5e1!3m2!1suz!2s!4v1767605828332!5m2!1suz!2s"
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px]"
              />
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

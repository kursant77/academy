import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Facebook, Instagram, Send, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { path: "/", label: t("nav.home") },
    { path: "/courses", label: t("nav.courses") },
    { path: "/teachers", label: t("nav.teachers") },
    { path: "/about", label: t("nav.about") },
    { path: "/events", label: t("nav.events") },
    { path: "/contact", label: t("nav.contact") },
  ];

  return (
    <footer className="w-full border-t border-border/50 bg-gradient-to-b from-background via-muted/10 to-muted/20 mt-12 sm:mt-16 md:mt-20 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-5" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12 lg:gap-16">
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center gap-2 sm:gap-3 group cursor-default">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-lg sm:text-xl tracking-tight shadow-lg group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-110">
                A+
              </div>
              <span className="font-bold text-xl sm:text-2xl bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto] group-hover:animate-gradient transition-all duration-300">A+ Academy</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("footer.about")}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <h3 className="font-bold text-base sm:text-lg text-foreground">{t("footer.quickLinks")}</h3>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {quickLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <Button
                    variant="ghost"
                    className="h-auto p-0 text-muted-foreground hover:text-primary justify-start transition-colors duration-200 font-medium"
                    data-testid={`link-footer-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <h3 className="font-bold text-base sm:text-lg text-foreground">{t("footer.followUs")}</h3>
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-full transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:border-primary hover:text-primary"
                onClick={() => window.open('https://facebook.com', '_blank')}
                data-testid="button-social-facebook"
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-full transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:border-primary hover:text-primary"
                onClick={() => window.open('https://instagram.com', '_blank')}
                data-testid="button-social-instagram"
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-full transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:border-primary hover:text-primary"
                onClick={() => window.open('https://t.me', '_blank')}
                data-testid="button-social-telegram"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-full transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:border-primary hover:text-primary"
                onClick={() => window.open('https://linkedin.com', '_blank')}
                data-testid="button-social-linkedin"
              >
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-6 sm:mt-8 md:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            © {new Date().getFullYear()} A+ Academy. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

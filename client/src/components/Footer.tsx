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
    <footer className="w-full border-t bg-gradient-to-b from-background to-muted/20 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl tracking-tight shadow-lg">
                A+
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">A+ Academy</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {t("footer.about")}
            </p>
          </div>

          <div className="space-y-5">
            <h3 className="font-bold text-lg text-foreground">{t("footer.quickLinks")}</h3>
            <div className="grid grid-cols-2 gap-3">
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

          <div className="space-y-5">
            <h3 className="font-bold text-lg text-foreground">{t("footer.followUs")}</h3>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:border-primary hover:text-primary"
                onClick={() => console.log('Facebook clicked')}
                data-testid="button-social-facebook"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:border-primary hover:text-primary"
                onClick={() => console.log('Instagram clicked')}
                data-testid="button-social-instagram"
              >
                <Instagram className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:border-primary hover:text-primary"
                onClick={() => console.log('Telegram clicked')}
                data-testid="button-social-telegram"
              >
                <Send className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-full transition-all duration-300 hover:scale-110 hover:bg-primary/10 hover:border-primary hover:text-primary"
                onClick={() => console.log('LinkedIn clicked')}
                data-testid="button-social-linkedin"
              >
                <Linkedin className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} A+ Academy. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}

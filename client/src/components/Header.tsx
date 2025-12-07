import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: t("nav.home") },
    { path: "/courses", label: t("nav.courses") },
    { path: "/teachers", label: t("nav.teachers") },
    { path: "/about", label: t("nav.about") },
    { path: "/events", label: t("nav.events") },
    { path: "/schedule", label: t("nav.schedule") },
    { path: "/achievements", label: t("nav.achievements") },
    { path: "/contact", label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 hover-elevate rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 transition-all duration-300 hover:scale-105">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <div className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-sm sm:text-base md:text-lg tracking-tight shadow-lg">
                A+
              </div>
              <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Academy</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <Button
                  variant={location === link.path ? "secondary" : "ghost"}
                  size="sm"
                  className={`text-xs sm:text-sm transition-all duration-300 ${
                    location === link.path 
                      ? "shadow-md" 
                      : "hover:bg-primary/5 hover:text-primary"
                  }`}
                  data-testid={`link-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/register" className="hidden md:block">
              <Button className="text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-300" data-testid="button-register">
                {t("nav.register")}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-primary/10 h-8 w-8 sm:h-9 sm:w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-3 sm:py-4 space-y-1.5 sm:space-y-2 border-t animate-fade-in-down">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path}>
                <Button
                  variant={location === link.path ? "secondary" : "ghost"}
                  className="w-full justify-start text-sm transition-all duration-200 h-9 sm:h-10"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            <Link href="/register">
              <Button className="w-full text-sm shadow-md h-9 sm:h-10" onClick={() => setMobileMenuOpen(false)} data-testid="button-mobile-register">
                {t("nav.register")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

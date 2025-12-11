import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, Home, GraduationCap, Users, Info, Calendar, Trophy, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: t("nav.home"), icon: Home },
    { path: "/courses", label: t("nav.courses"), icon: GraduationCap },
    { path: "/teachers", label: t("nav.teachers"), icon: Users },
    { path: "/about", label: t("nav.about"), icon: Info },
    { path: "/events", label: t("nav.events"), icon: Calendar },
    { path: "/achievements", label: t("nav.achievements"), icon: Trophy },
    { path: "/contact", label: t("nav.contact"), icon: Mail },
  ];

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm shadow-primary/5">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 md:h-20 items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 hover-elevate rounded-lg px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2.5">
              <div className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xs sm:text-sm md:text-lg tracking-tight shadow-lg group-hover:shadow-xl group-hover:shadow-primary/30 transition-all duration-300 group-hover:scale-110">
                A+
              </div>
              <span className="font-bold text-base sm:text-lg md:text-xl bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto] group-hover:animate-gradient transition-all duration-300">Academy</span>
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
              <Button className="text-xs sm:text-sm shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80" data-testid="button-register">
                {t("nav.register")}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-primary/10 h-9 w-9 sm:h-10 sm:w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
              aria-label="Mobile menu"
            >
              <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
              onClick={() => setMobileMenuOpen(false)}
              style={{ top: '56px' }}
            />
            
            {/* Mobile menu panel */}
            <div className="md:hidden fixed left-0 right-0 top-[56px] sm:top-[64px] bottom-0 z-50 bg-gradient-to-br from-background via-background to-muted/30 backdrop-blur-xl border-t border-border/50 shadow-2xl animate-slide-in-down overflow-y-auto">
              <div className="max-w-sm mx-auto px-4 py-6 space-y-3">
                {/* Menu header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg">
                      A+
                    </div>
                    <span className="font-bold text-lg bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                      Menu
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation links */}
                <div className="space-y-2">
                  {navLinks.map((link, index) => {
                    const Icon = link.icon;
                    const isActive = location === link.path;
                    return (
                      <Link key={link.path} href={link.path} className="block">
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={`w-full justify-start text-base transition-all duration-300 h-12 font-medium rounded-xl group ${
                            isActive
                              ? "bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/30 shadow-lg shadow-primary/10 text-primary"
                              : "hover:bg-primary/5 hover:border-primary/20 text-foreground"
                          } border border-border/50 hover:scale-[1.02] hover:shadow-md`}
                          onClick={() => setMobileMenuOpen(false)}
                          data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <span className="flex items-center gap-3 w-full">
                            <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                              isActive 
                                ? "bg-primary/20 text-primary" 
                                : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                            }`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="flex-1">{link.label}</span>
                            {isActive && (
                              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                            )}
                          </span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>

                {/* Register button */}
                <div className="pt-4 border-t border-border/50">
                  <Link href="/register" className="block">
                    <Button 
                      className="w-full text-base shadow-lg hover:shadow-xl transition-all duration-300 h-12 font-semibold bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 rounded-xl hover:scale-[1.02] relative overflow-hidden group" 
                      onClick={() => setMobileMenuOpen(false)} 
                      data-testid="button-mobile-register"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {t("nav.register")}
                      </span>
                    </Button>
                  </Link>
                </div>

                {/* Footer info */}
                <div className="pt-6 mt-6 border-t border-border/50">
                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                      © {new Date().getFullYear()} A+ Academy
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <LanguageSwitcher />
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

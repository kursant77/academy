import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, Home, GraduationCap, Users, Info, Calendar, Trophy, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { useSwipeGesture } from "@/hooks/use-swipe-gesture";

export function Header() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Enable swipe from left to open mobile menu
  useSwipeGesture(() => setMobileMenuOpen(true));

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

  const toggleMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm shadow-primary/5">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative">
          <div className="flex h-14 sm:h-16 md:h-20 items-center justify-between gap-2 sm:gap-4 relative">
            <Logo variant="header" showText={true} linkTo="/" />

            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link key={link.path} href={link.path}>
                  <Button
                    variant={location === link.path ? "secondary" : "ghost"}
                    size="sm"
                    className={`text-xs sm:text-sm transition-all duration-300 ${location === link.path
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
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-md hover:bg-primary/10 active:bg-primary/20 transition-colors cursor-pointer border border-transparent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 touch-manipulation"
                onClick={toggleMenu}
                data-testid="button-mobile-menu"
                aria-label="Mobile menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 sm:h-6 sm:w-6 pointer-events-none" />
                ) : (
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6 pointer-events-none" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="md:hidden fixed inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 backdrop-blur-md z-[9998] animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
            style={{ top: '56px' }}
            aria-hidden="true"
          />

          {/* Mobile menu panel */}
          <div className="md:hidden fixed left-0 right-0 top-[56px] sm:top-[64px] md:top-[80px] bottom-0 z-[9999] bg-gradient-to-b from-background via-background/98 to-background/95 backdrop-blur-2xl border-t-2 border-primary/20 shadow-2xl shadow-primary/10 animate-slide-in-down overflow-y-auto">
            <div className="max-w-sm mx-auto px-5 py-8 space-y-4">
              {/* Navigation links */}
              <div className="space-y-3">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  const isActive = location === link.path;
                  return (
                    <Link key={link.path} href={link.path} className="block">
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full justify-start text-base transition-all duration-300 h-14 font-semibold rounded-2xl group relative overflow-hidden ${isActive
                          ? "bg-gradient-to-r from-primary/25 via-primary/15 to-primary/25 border-2 border-primary/40 shadow-xl shadow-primary/20 text-primary"
                          : "hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-primary/10 border-2 border-transparent hover:border-primary/20 text-foreground hover:text-primary"
                          } hover:scale-[1.02] hover:shadow-lg`}
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                        style={{ animationDelay: `${index * 0.06}s` }}
                      >
                        {/* Active indicator line */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/80 to-primary rounded-r-full" />
                        )}

                        <span className="flex items-center gap-4 w-full relative z-10">
                          <div className={`p-2.5 rounded-xl transition-all duration-300 ${isActive
                            ? "bg-primary/25 text-primary shadow-md shadow-primary/20"
                            : "bg-muted/60 text-muted-foreground group-hover:bg-primary/15 group-hover:text-primary group-hover:shadow-md"
                            }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span className="flex-1 text-left font-semibold">{link.label}</span>
                          {isActive && (
                            <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                          )}
                          {!isActive && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                            </div>
                          )}
                        </span>
                      </Button>
                    </Link>
                  );
                })}
              </div>

              {/* Register button */}
              <div className="pt-6 border-t-2 border-primary/10">
                <Link href="/register" className="block">
                  <Button
                    className="w-full text-base shadow-2xl hover:shadow-primary/30 transition-all duration-300 h-14 font-bold bg-gradient-to-r from-primary via-primary/95 to-primary hover:from-primary/95 hover:via-primary hover:to-primary/95 rounded-2xl hover:scale-[1.02] relative overflow-hidden group border-2 border-primary/30"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="button-mobile-register"
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />

                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <span className="relative z-10 flex items-center justify-center gap-3">
                      <BookOpen className="h-5 w-5" />
                      <span className="text-base font-bold">{t("nav.register")}</span>
                    </span>
                  </Button>
                </Link>
              </div>

              {/* Footer info */}
              <div className="pt-8 mt-8 border-t-2 border-primary/10">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3 p-3 rounded-xl bg-muted/30">
                    <LanguageSwitcher />
                    <div className="h-6 w-px bg-border" />
                    <ThemeToggle />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    © {new Date().getFullYear()} IELTS Imperia. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useContent } from "@/hooks/use-content";

export function Hero() {
  const { t, i18n } = useTranslation();
  const { content } = useContent("hero", i18n.language);

  return (
    <section className="relative w-full py-12 sm:py-16 md:py-24 lg:py-32 xl:py-40 overflow-visible">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)] -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.15),transparent_50%)] -z-10" />
      <div className="absolute inset-0 bg-pattern-dots opacity-20 -z-10" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -z-10 animate-float" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-6 sm:gap-8 md:gap-10 max-w-6xl mx-auto w-full">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-fade-in-down whitespace-nowrap">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-primary break-keep">{t("hero.badge") || "Professional ta'lim"}</span>
          </div>

          <div className="space-y-4 sm:space-y-6 animate-fade-in-up w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight gradient-text animate-gradient leading-tight sm:leading-tight md:leading-tight lg:leading-tight break-words overflow-visible px-2 sm:px-4" style={{ height: '79px' }}>
              {content.title || t("hero.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed px-2 sm:px-4 break-words overflow-visible">
              {content.subtitle || t("hero.subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto animate-fade-in-up px-2 sm:px-0" style={{ animationDelay: '0.2s' }}>
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="gap-2 w-full sm:w-auto text-sm sm:text-base px-5 sm:px-6 md:px-8 py-5 sm:py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
                data-testid="button-hero-register"
              >
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate sm:whitespace-normal">{content.primary_cta || t("hero.registerBtn")}</span>
              </Button>
            </Link>
            <Link href="/courses" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 w-full sm:w-auto text-sm sm:text-base px-5 sm:px-6 md:px-8 py-5 sm:py-6 border-2 hover:bg-primary/5 transition-all duration-300 hover:scale-105 whitespace-nowrap"
                data-testid="button-hero-courses"
              >
                <span className="truncate sm:whitespace-normal">{content.secondary_cta || t("hero.viewCoursesBtn")}</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-10 md:mt-12 text-xs sm:text-sm text-muted-foreground animate-fade-in-up px-2" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>{t("hero.live") || "Live Classes"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
              <span>{t("hero.certified") || "Certified Teachers"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '1s' }} />
              <span>{t("hero.flexible") || "Flexible Schedule"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

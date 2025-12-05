import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useContent } from "@/hooks/use-content";

export function Hero() {
  const { t, i18n } = useTranslation();
  const { content } = useContent("hero", i18n.language);

  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-background -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.15),transparent_50%)] -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.15),transparent_50%)] -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center gap-10 max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm animate-fade-in-down">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t("hero.badge") || "Professional Education"}</span>
          </div>

          <div className="space-y-6 animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              {content.title || t("hero.title")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {content.subtitle || t("hero.subtitle")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/register">
              <Button 
                size="lg" 
                className="gap-2 w-full sm:w-auto text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105" 
                data-testid="button-hero-register"
              >
                <BookOpen className="h-5 w-5" />
                {content.primary_cta || t("hero.registerBtn")}
              </Button>
            </Link>
            <Link href="/courses">
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 w-full sm:w-auto text-base px-8 py-6 border-2 hover:bg-primary/5 transition-all duration-300 hover:scale-105" 
                data-testid="button-hero-courses"
              >
                {content.secondary_cta || t("hero.viewCoursesBtn")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
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

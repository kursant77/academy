import { useTranslation } from "react-i18next";
import { Users, Award, BookOpen, GraduationCap, LucideIcon } from "lucide-react";
import { useEffect, useState, useRef, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { SiteStat } from "@shared/schema";

// Memoize icon map to prevent recreation
const iconMap: Record<string, LucideIcon> = {
  Users,
  Award,
  BookOpen,
  GraduationCap,
};

interface Stat {
  icon: React.ReactNode;
  value: string;
  label: string;
  numericValue: number;
}

function useCountUp(end: number, duration: number = 2000, start: number = 0): number {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number>();
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple animations
    if (hasAnimatedRef.current) return;

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.floor(start + (end - start) * easeOut);

      if (currentCount !== countRef.current) {
        countRef.current = currentCount;
        setCount(currentCount);
      }

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        hasAnimatedRef.current = true;
      }
    };

    // Start animation when component mounts
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            startTimeRef.current = null;
            countRef.current = start;
            setCount(start);
            requestRef.current = requestAnimationFrame(animate);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' } // Optimize threshold
    );

    const element = document.querySelector('[data-stats-container]');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      observer.disconnect();
    };
  }, [end, duration, start]);

  return count;
}

function AnimatedStat({ stat, index }: { stat: Stat; index: number }) {
  const count = useCountUp(stat.numericValue, 2000, 0);
  const displayValue = stat.value.includes('+') 
    ? `${count.toLocaleString()}+` 
    : stat.value.includes('-')
    ? `${count}-`
    : count.toString();

  return (
    <div
      className="flex flex-col items-center text-center gap-4 animate-fade-in-up group cursor-default"
      style={{ animationDelay: `${index * 0.1}s` }}
      data-testid={`stat-${index}`}
    >
      <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/20 border border-primary/10 group-hover:border-primary/30">
        <div className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          {stat.icon}
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto] transition-all duration-300 group-hover:animate-gradient" data-testid={`stat-value-${index}`}>
          {displayValue}
        </div>
        <div className="text-sm md:text-base text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 font-medium">
          {stat.label}
        </div>
      </div>
    </div>
  );
}

export function StatsBar() {
  const { t, i18n } = useTranslation();
  const [siteStats, setSiteStats] = useState<SiteStat[]>([]);

  useEffect(() => {
    let active = true;
    async function fetchStats() {
      const { data, error } = await supabase.from("site_stats").select("*").order("created_at");
      if (!error && data && active) {
        setSiteStats(data);
      }
    }
    fetchStats();
    return () => {
      active = false;
    };
  }, []);

  const stats: Stat[] = useMemo(() => {
    if (siteStats.length === 0) {
      return [
        {
          icon: <Users className="h-8 w-8 text-primary" />,
          value: "2,500+",
          label: t("stats.students"),
          numericValue: 2500,
        },
        {
          icon: <Award className="h-8 w-8 text-primary" />,
          value: "12+",
          label: t("stats.years"),
          numericValue: 12,
        },
        {
          icon: <BookOpen className="h-8 w-8 text-primary" />,
          value: "25+",
          label: t("stats.courses"),
          numericValue: 25,
        },
        {
          icon: <GraduationCap className="h-8 w-8 text-primary" />,
          value: "1,800+",
          label: t("stats.graduates"),
          numericValue: 1800,
        },
      ];
    }

    return siteStats.map((stat) => {
      const Icon = iconMap[stat.icon] || Users;
      const label =
        i18n.language === "ru"
          ? stat.label_ru
          : i18n.language === "en"
          ? stat.label_en
          : stat.label_uz;
      const numeric = parseInt(stat.value.replace(/[^\d]/g, ""), 10) || 0;
      return {
        icon: <Icon className="h-8 w-8 text-primary" />,
        value: stat.value,
        label,
        numericValue: numeric,
      };
    });
  }, [siteStats, i18n.language]);

  return (
    <section className="w-full py-12 md:py-16 bg-gradient-to-b from-muted/30 via-background to-background relative overflow-hidden" data-stats-container>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-pattern-dots opacity-10" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <AnimatedStat key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

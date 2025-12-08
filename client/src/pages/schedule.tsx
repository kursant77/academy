import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Globe, User, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { ScheduleEntry } from "@shared/schema";
import { SEO } from "@/components/SEO";

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Schedule() {
  const { t, i18n } = useTranslation();
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchSchedule() {
      try {
        // Schedule entries ni olib kelish (groups avtomatik qo'shilgan)
        const { data, error } = await supabase
          .from("schedule_entries")
          .select("*")
          .order("day_of_week")
          .order("start_time");

        if (!error && data && active) {
          setEntries(data);
        }
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    return dayOrder.map((day) => ({
      day,
      entries: entries.filter((entry) => entry.day_of_week === day),
    }));
  }, [entries]);

  const dayLabel = (day: string) => {
    switch (day) {
      case "Monday":
        return t("schedule.monday");
      case "Tuesday":
        return t("schedule.tuesday");
      case "Wednesday":
        return t("schedule.wednesday");
      case "Thursday":
        return t("schedule.thursday");
      case "Friday":
        return t("schedule.friday");
      case "Saturday":
        return t("schedule.saturday");
      case "Sunday":
        return t("schedule.sunday");
      default:
        return day;
    }
  };

  // Kunlar uchun bir xil dizayn, lekin animatsiyali accent
  const getDayAccent = (day: string) => {
    const accents: Record<string, string> = {
      Monday: "from-blue-500 via-indigo-500 to-purple-500",
      Tuesday: "from-purple-500 via-pink-500 to-rose-500",
      Wednesday: "from-emerald-500 via-teal-500 to-cyan-500",
      Thursday: "from-amber-500 via-orange-500 to-red-500",
      Friday: "from-rose-500 via-red-500 to-pink-500",
      Saturday: "from-cyan-500 via-sky-500 to-blue-500",
      Sunday: "from-violet-500 via-fuchsia-500 to-pink-500",
    };
    return accents[day] || accents.Monday;
  };

  return (
    <>
      <SEO
        title="Dars jadvali"
        description="A+ Academy dars jadvali. Barcha kurslar, vaqtlar, xonalar va o'qituvchilar. Onlayn va oflayn darslar."
        keywords="dars jadvali, jadval, A+ Academy, kurslar jadvali, dars vaqtlari"
        url="/schedule"
      />
      <div className="min-h-screen relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

        <div className="relative py-12 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            {/* Header Section */}
            <div className="mb-12 md:mb-16 text-center animate-fade-in-down">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <CalendarIcon className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {t("schedule.title")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("schedule.subtitle")}
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-muted-foreground text-lg">Yuklanmoqda...</p>
              </div>
            ) : entries.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Jadval hozircha bo'sh</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Darslar jadvali tez orada qo'shiladi. Kuting!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:gap-8">
                {grouped.map(({ day, entries }, dayIndex) => {
                  if (entries.length === 0) return null;
                  const dayAccent = getDayAccent(day);

                  return (
                    <div
                      key={day}
                      className="relative group rounded-2xl border-2 border-border/50 bg-gradient-to-br from-background via-card to-background shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden animate-fade-in-up backdrop-blur-sm"
                      style={{ animationDelay: `${dayIndex * 0.1}s` }}
                    >
                      {/* Animated gradient background overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0" />
                      
                      {/* Animated shimmer effect */}
                      <div className="absolute inset-0 -z-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        {/* Day Header */}
                        <div className="relative px-6 py-4 md:px-8 md:py-6 border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent backdrop-blur-sm">
                          {/* Animated accent bar */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${dayAccent} rounded-r-full animate-pulse`} 
                            style={{
                              animation: `gradient-shift-${dayIndex} 3s ease-in-out infinite`,
                            }}
                          />
                          
                          <div className="flex items-center gap-4 pl-6">
                            <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${dayAccent} p-[2px] animate-spin-slow`}>
                              <div className="w-full h-full rounded-xl bg-background flex items-center justify-center">
                                <CalendarIcon className="w-5 h-5 text-primary" />
                              </div>
                            </div>
                            <div>
                              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient flex items-center gap-3">
                                {dayLabel(day)}
                              </h2>
                              <p className="text-sm md:text-base text-muted-foreground mt-1 flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse" />
                                {entries.length} {entries.length === 1 ? "dars" : "dars"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Entries Grid */}
                        <div className="p-6 md:p-8 bg-gradient-to-b from-transparent to-muted/10">
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {entries.map((item, itemIndex) => (
                              <div
                                key={item.id}
                                className="group/item relative bg-card/80 backdrop-blur-md border border-border/50 rounded-xl p-5 md:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-500 hover:border-primary/50 hover:bg-card animate-fade-in overflow-hidden"
                                style={{ animationDelay: `${(dayIndex * 0.1) + (itemIndex * 0.05)}s` }}
                              >
                                {/* Animated gradient accent bar */}
                                <div 
                                  className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${dayAccent} rounded-l-xl opacity-0 group-hover/item:opacity-100 transition-all duration-500 group-hover/item:w-1.5 animate-pulse`}
                                />
                                
                                {/* Hover gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 -z-0" />

                                {/* Course Title */}
                                <div className="mb-4 relative z-10">
                                  <h3 className="font-bold text-lg md:text-xl mb-2 line-clamp-2 bg-gradient-to-r from-foreground to-foreground/70 group-hover/item:from-primary group-hover/item:to-primary/70 bg-clip-text text-transparent transition-all duration-300">
                                    {i18n.language === "ru"
                                      ? item.title_ru
                                      : i18n.language === "en"
                                      ? item.title_en
                                      : item.title_uz}
                                  </h3>
                                </div>

                                {/* Details */}
                                <div className="space-y-3 relative z-10">
                                  {/* Time */}
                                  <div className="flex items-center gap-2 text-sm group/icon">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary group-hover/item:from-primary/30 group-hover/item:to-primary/20 transition-all duration-300 shadow-sm">
                                      <Clock className="w-4 h-4 group-hover/icon:animate-spin" />
                                    </div>
                                    <span className="font-medium text-foreground">
                                      {item.start_time} - {item.end_time}
                                    </span>
                                  </div>

                                  {/* Room */}
                                  {item.room && (
                                    <div className="flex items-center gap-2 text-sm group/icon">
                                      <div className="p-2 rounded-lg bg-gradient-to-br from-secondary/20 to-secondary/10 text-secondary-foreground group-hover/item:from-secondary/30 group-hover/item:to-secondary/20 transition-all duration-300 shadow-sm">
                                        <MapPin className="w-4 h-4 group-hover/icon:scale-110 transition-transform" />
                                      </div>
                                      <span className="text-muted-foreground">
                                        {t("schedule.room")} <span className="font-medium">{item.room}</span>
                                      </span>
                                    </div>
                                  )}

                                  {/* Teacher */}
                                  {item.teacher_name && (
                                    <div className="flex items-center gap-2 text-sm group/icon">
                                      <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 text-accent-foreground group-hover/item:from-accent/30 group-hover/item:to-accent/20 transition-all duration-300 shadow-sm">
                                        <User className="w-4 h-4 group-hover/icon:scale-110 transition-transform" />
                                      </div>
                                      <span className="text-muted-foreground">
                                        <span className="font-medium">{item.teacher_name}</span>
                                      </span>
                                    </div>
                                  )}

                                  {/* Format Badge */}
                                  <div className="pt-2">
                                    <Badge
                                      variant={item.format === "online" ? "default" : "secondary"}
                                      className="gap-1.5 px-3 py-1.5 text-xs font-medium group-hover/item:scale-105 transition-transform duration-300"
                                    >
                                      {item.format === "online" ? (
                                        <>
                                          <Globe className="h-3.5 w-3.5 group-hover/item:animate-pulse" />
                                          {t("schedule.online")}
                                        </>
                                      ) : (
                                        <>
                                          <MapPin className="h-3.5 w-3.5 group-hover/item:animate-bounce" />
                                          {t("schedule.offline")}
                                        </>
                                      )}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

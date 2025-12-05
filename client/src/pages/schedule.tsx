import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Globe } from "lucide-react";
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
      const { data, error } = await supabase
        .from("schedule_entries")
        .select("*")
        .order("day_of_week")
        .order("start_time");

      if (!error && data && active) {
        setEntries(data);
      }
      setLoading(false);
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

  return (
    <>
      <SEO
        title="Dars jadvali"
        description="A+ Academy dars jadvali. Barcha kurslar, vaqtlar, xonalar va o'qituvchilar. Onlayn va oflayn darslar."
        keywords="dars jadvali, jadval, A+ Academy, kurslar jadvali, dars vaqtlari"
        url="/schedule"
      />
      <div className="min-h-screen py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("schedule.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("schedule.subtitle")}</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Yuklanmoqda...</div>
        ) : (
          <div className="grid gap-6">
            {grouped.map(({ day, entries }) => {
              if (entries.length === 0) return null;

              return (
                <Card key={day}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{dayLabel(day)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {entries.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30"
                        >
                          <div className="flex-1 space-y-2">
                            <div className="font-semibold text-lg">
                              {i18n.language === "ru"
                                ? item.title_ru
                                : i18n.language === "en"
                                ? item.title_en
                                : item.title_uz}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {item.start_time} - {item.end_time}
                                </span>
                              </div>
                              {item.room && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>
                                    {t("schedule.room")} {item.room}
                                  </span>
                                </div>
                              )}
                            {item.teacher_name && (
                              <div className="text-xs text-muted-foreground">
                                {item.teacher_name}
                              </div>
                            )}
                            </div>
                            <Badge
                              variant={item.format === "online" ? "default" : "secondary"}
                              className="gap-1"
                            >
                              {item.format === "online" && <Globe className="h-3 w-3" />}
                              {item.format === "online"
                                ? t("schedule.online")
                                : t("schedule.offline")}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

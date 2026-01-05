import { memo } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Star, User, ArrowRight, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";

interface CourseCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: string;
  price: string;
  level: string;
  teacherName: string;
  imageUrl?: string;
  isFeatured?: boolean;
}

export const CourseCard = memo(function CourseCard({
  id,
  name,
  description,
  category,
  duration,
  price,
  level,
  teacherName,
  imageUrl = undefined,
  isFeatured = false,
}: CourseCardProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const getCategoryColor = (cat: string) => {
    if (cat === "IT") return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
    if (cat === "Languages") return "bg-green-500/10 text-green-700 dark:text-green-300";
    return "bg-purple-500/10 text-purple-700 dark:text-purple-300";
  };

  return (
    <Card className="group hover-elevate overflow-hidden flex flex-col h-full relative border-2 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02]">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
      </div>

      {isFeatured && (
        <div className="absolute top-4 right-4 z-10 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 backdrop-blur-md shadow-xl p-2.5 text-primary-foreground animate-pulse border-2 border-primary/30">
          <Star className="h-4 w-4 fill-current" />
        </div>
      )}
      {(() => {
        const hasImage = imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '';
        return hasImage ? (
          <div className="h-52 w-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <img 
              src={imageUrl} 
              alt={`${name} kursi - IELTS Imperia Toshkent | ${category} | ${level} | Professional ta'lim`}
              title={`${name} kursi - IELTS Imperia Toshkent | ${category} | ${level}`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-115 relative z-10"
              loading="lazy"
              decoding="async"
              width="400"
              height="300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="h-52 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center relative"><div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div><div class="text-6xl text-primary/30 font-bold group-hover:text-primary/40 transition-colors duration-300 relative z-10">${name.charAt(0)}</div></div>`;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
          </div>
        ) : (
          <div className="h-52 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center relative group-hover:from-primary/30 group-hover:via-accent/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="text-6xl text-primary/30 font-bold group-hover:text-primary/40 transition-all duration-500 group-hover:scale-110 relative z-10">
              {name.charAt(0)}
            </div>
          </div>
        );
      })()}
      
      <CardHeader className="space-y-4 pb-4 relative z-10">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <Badge className={`${getCategoryColor(category)} border transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`} data-testid="badge-category">
            {category}
          </Badge>
          <Badge variant="secondary" className="transition-all duration-300 group-hover:scale-110 group-hover:shadow-md" data-testid="badge-level">
            {level}
          </Badge>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" data-testid="text-course-name">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
            {description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1 relative z-10">
        <div className="flex items-center gap-2 text-sm p-2.5 rounded-lg hover:bg-muted/50 transition-all duration-300 group-hover:translate-x-1">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-muted-foreground">{t("courses.teacher")}:</span>
          <span className="font-semibold group-hover:text-primary transition-colors duration-300">{teacherName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm p-2.5 rounded-lg hover:bg-muted/50 transition-all duration-300 group-hover:translate-x-1">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110">
            <Clock className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-muted-foreground">{t("courses.duration")}:</span>
          <span className="font-semibold group-hover:text-primary transition-colors duration-300">{duration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm p-2.5 rounded-lg hover:bg-muted/50 transition-all duration-300 group-hover:translate-x-1">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300 group-hover:scale-110">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-muted-foreground">{t("courses.price")}:</span>
          <span className="font-semibold text-primary group-hover:scale-110 inline-block transition-transform duration-300">{price}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-4 relative z-10">
        <Button 
          className="w-full group/btn transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/50 bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 relative overflow-hidden" 
          data-testid="button-enroll-course"
          onClick={() => setLocation(`/register?courseId=${id}`)}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
          <LogIn className="h-4 w-4 mr-2 transition-transform duration-300 group-hover/btn:-translate-y-0.5 relative z-10" />
          <span className="relative z-10">Kursga yozilish</span>
          <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1 relative z-10" />
        </Button>
      </CardFooter>
    </Card>
  );
});

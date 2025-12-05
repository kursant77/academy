import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign, Star, User, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

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

export function CourseCard({
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

  const getCategoryColor = (cat: string) => {
    if (cat === "IT") return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
    if (cat === "Languages") return "bg-green-500/10 text-green-700 dark:text-green-300";
    return "bg-purple-500/10 text-purple-700 dark:text-purple-300";
  };

  return (
    <Card className="group hover-elevate overflow-hidden flex flex-col h-full relative border-2 transition-all duration-300 hover:border-primary/20 hover:shadow-xl">
      {isFeatured && (
        <div className="absolute top-4 right-4 z-10 rounded-full bg-gradient-to-br from-primary to-primary/80 backdrop-blur-sm shadow-lg p-2.5 text-primary-foreground animate-pulse">
          <Star className="h-4 w-4 fill-current" />
        </div>
      )}
      {(() => {
        const hasImage = imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '';
        return hasImage ? (
          <div className="h-52 w-full overflow-hidden relative">
            <img 
              src={imageUrl} 
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                // Agar rasm yuklanmasa, fallback ko'rsatish
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="h-52 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center"><div class="text-6xl text-primary/30 font-bold">${name.charAt(0)}</div></div>`;
                }
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        ) : (
          <div className="h-52 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center group-hover:from-primary/30 group-hover:via-accent/20 transition-all duration-300">
            <div className="text-6xl text-primary/30 font-bold group-hover:text-primary/40 transition-colors duration-300">
              {name.charAt(0)}
            </div>
          </div>
        );
      })()}
      
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <Badge className={`${getCategoryColor(category)} border transition-all duration-300 group-hover:scale-105`} data-testid="badge-category">
            {category}
          </Badge>
          <Badge variant="secondary" className="transition-all duration-300 group-hover:scale-105" data-testid="badge-level">
            {level}
          </Badge>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors duration-300" data-testid="text-course-name">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-1">
        <div className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
          <div className="p-1.5 rounded-md bg-primary/10">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-muted-foreground">{t("courses.teacher")}:</span>
          <span className="font-semibold">{teacherName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Clock className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-muted-foreground">{t("courses.duration")}:</span>
          <span className="font-semibold">{duration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors duration-200">
          <div className="p-1.5 rounded-md bg-primary/10">
            <DollarSign className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-muted-foreground">{t("courses.price")}:</span>
          <span className="font-semibold text-primary">{price}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button className="w-full group/btn transition-all duration-300 hover:scale-105" data-testid="button-view-course">
          {t("courses.viewDetails")}
          <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

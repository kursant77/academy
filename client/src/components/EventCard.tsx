import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: Date;
  category: string;
  imageUrl?: string;
  isFeatured?: boolean;
}

export function EventCard({
  title,
  description,
  date,
  category,
  imageUrl,
  isFeatured = false,
}: EventCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="group hover-elevate overflow-hidden flex flex-col h-full relative border-2 transition-all duration-300 hover:border-primary/20 hover:shadow-xl">
      {isFeatured && (
        <div className="absolute top-4 right-4 z-10 rounded-full bg-gradient-to-br from-primary to-primary/80 backdrop-blur-sm shadow-lg p-2.5 text-primary-foreground animate-pulse">
          <Star className="h-4 w-4 fill-current" />
        </div>
      )}
      {imageUrl ? (
        <div className="h-52 w-full overflow-hidden relative">
          <img 
            src={imageUrl} 
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `<div class="h-52 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/5 flex items-center justify-center relative"><div class="text-6xl text-primary/30 font-bold">${title.charAt(0)}</div><div class="absolute top-4 right-4"><div class="bg-background/90 backdrop-blur px-2 py-1 rounded text-xs flex items-center gap-1"><svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>${format(date, "dd MMM yyyy")}</div></div></div>`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-background/90 backdrop-blur-sm border shadow-lg transition-all duration-300 group-hover:scale-105" data-testid="badge-date">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {format(date, "dd MMM yyyy")}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="h-52 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/5 flex items-center justify-center relative group-hover:from-accent/30 group-hover:via-primary/20 transition-all duration-300">
          <div className="text-6xl text-primary/30 font-bold group-hover:text-primary/40 transition-colors duration-300">
            {title.charAt(0)}
          </div>
          <div className="absolute top-4 right-4">
            <Badge className="bg-background/90 backdrop-blur-sm border shadow-lg transition-all duration-300 group-hover:scale-105" data-testid="badge-date">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {format(date, "dd MMM yyyy")}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="space-y-3">
        <div className="space-y-2">
          <Badge variant="secondary" className="transition-all duration-300 group-hover:scale-105" data-testid="badge-category">
            {category}
          </Badge>
          <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors duration-300" data-testid="text-event-title">
            {title}
          </h3>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {description}
        </p>
      </CardContent>

      <CardFooter className="pt-4">
        <Button variant="outline" className="w-full gap-2 group/btn transition-all duration-300 hover:scale-105 hover:border-primary" data-testid="button-read-more">
          {t("events.readMore")}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

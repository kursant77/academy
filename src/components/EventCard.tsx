import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star } from "lucide-react";
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

export const EventCard = memo(function EventCard({
  title,
  description,
  date,
  category,
  imageUrl,
  isFeatured = false,
}: EventCardProps) {
  const { t } = useTranslation();

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
      {imageUrl ? (
        <div className="h-52 w-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <img 
            src={imageUrl} 
            alt={`${title} - ${category} tadbiri | IELTS Imperia Toshkent | ${format(date, "dd MMMM yyyy")}`}
            title={`${title} - ${category} tadbiri | IELTS Imperia Toshkent | ${format(date, "dd MMMM yyyy")}`}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-115 relative z-10"
            loading="lazy"
            decoding="async"
            width="400"
            height="300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `<div class="h-52 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/5 flex items-center justify-center relative"><div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div><div class="text-6xl text-primary/30 font-bold group-hover:text-primary/40 transition-all duration-500 group-hover:scale-110 relative z-10">${title.charAt(0)}</div><div class="absolute top-4 right-4 z-20"><div class="bg-background/90 backdrop-blur px-2 py-1 rounded text-xs flex items-center gap-1 border shadow-lg transition-all duration-300 group-hover:scale-105"><svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>${format(date, "dd MMM yyyy")}</div></div></div>`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent z-20" />
          <div className="absolute bottom-0 left-0 right-0 p-4 z-30">
            <h3 className="text-xl font-bold text-white drop-shadow-lg line-clamp-2 group-hover:text-primary-foreground transition-all duration-300">
              {title}
            </h3>
          </div>
          <div className="absolute top-4 right-4 z-30">
            <Badge className="bg-background/90 backdrop-blur-md border shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl" data-testid="badge-date">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {format(date, "dd MMM yyyy")}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="h-52 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/5 flex flex-col items-center justify-center relative group-hover:from-accent/30 group-hover:via-primary/20 transition-all duration-500 p-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="text-6xl text-primary/30 font-bold group-hover:text-primary/40 transition-all duration-500 group-hover:scale-110 relative z-10 mb-2">
            {title.charAt(0)}
          </div>
          <h3 className="text-xl font-bold text-foreground line-clamp-2 text-center group-hover:text-primary transition-all duration-300 relative z-10">
            {title}
          </h3>
          <div className="absolute top-4 right-4 z-20">
            <Badge className="bg-background/90 backdrop-blur-md border shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl" data-testid="badge-date">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {format(date, "dd MMM yyyy")}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="space-y-3 relative z-10">
        <div className="space-y-2">
          <Badge variant="secondary" className="transition-all duration-300 group-hover:scale-110 group-hover:shadow-md" data-testid="badge-category">
            {category}
          </Badge>
          {!imageUrl && (
            <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" data-testid="text-event-title">
              {title}
            </h3>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 relative z-10">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
          {description}
        </p>
      </CardContent>
    </Card>
  );
});

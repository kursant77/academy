import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Send, Instagram, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

interface TeacherCardProps {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  bio: string;
  imageUrl?: string;
  linkedIn?: string;
  telegram?: string;
  instagram?: string;
  isFeatured?: boolean;
}

export const TeacherCard = memo(function TeacherCard({
  name,
  specialty,
  experience,
  bio,
  imageUrl,
  linkedIn,
  telegram,
  instagram,
  isFeatured = false,
}: TeacherCardProps) {
  const { t } = useTranslation();

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="group relative overflow-hidden flex flex-col h-full border-2 border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:scale-[1.02]">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
      </div>

      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-0" />

      {isFeatured && (
        <div className="absolute top-4 right-4 z-10 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/80 backdrop-blur-md shadow-xl p-2.5 text-primary-foreground animate-pulse border-2 border-primary/30 group-hover:scale-110 transition-transform duration-300">
          <Star className="h-4 w-4 fill-current" />
        </div>
      )}

      <CardContent className="relative z-10 pt-8 pb-4 space-y-5 flex-1">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Avatar with enhanced styling */}
          {imageUrl ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl transition-all duration-500 group-hover:border-primary/60 group-hover:scale-110 group-hover:shadow-primary/20">
                <img 
                  src={imageUrl} 
                  alt={`${name} - ${specialty} o'qituvchisi | IELTS Imperia Toshkent | ${experience} yillik tajriba`}
                  title={`${name} - ${specialty} | IELTS Imperia Toshkent | ${experience} yillik tajriba`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-115"
                  loading="lazy"
                  decoding="async"
                  width="128"
                  height="128"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<div class="h-32 w-32 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-2xl">${initials}</div>`;
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-32 w-32 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-primary/30">
                {initials}
              </div>
            </div>
          )}
          
          {/* Name and specialty with gradient */}
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent bg-[length:200%_auto] group-hover:animate-gradient transition-all duration-500 group-hover:scale-105 inline-block" data-testid="text-teacher-name">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground font-medium px-2 group-hover:text-foreground/80 transition-colors duration-300">{specialty}</p>
          </div>
          
          {/* Experience badge with enhanced styling */}
          <Badge 
            variant="secondary" 
            className="px-4 py-1.5 text-xs font-semibold bg-gradient-to-r from-secondary/50 to-secondary/30 border border-border/50 group-hover:from-primary/20 group-hover:to-secondary/20 group-hover:border-primary/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md" 
            data-testid="badge-experience"
          >
            <Star className="h-3 w-3 mr-1.5 fill-current text-primary group-hover:animate-pulse" />
            {experience} {t("teachers.experience")}
          </Badge>
        </div>
        
        {/* Bio with improved styling */}
        <p className="text-sm text-muted-foreground text-center line-clamp-3 leading-relaxed px-3 group-hover:text-foreground/80 transition-colors duration-300 group-hover:translate-y-[-2px]">
          {bio}
        </p>

        {/* Social links with enhanced styling */}
        {(linkedIn || telegram || instagram) && (
          <div className="flex items-center justify-center gap-2 pt-2">
            {linkedIn && (
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:bg-primary/10 hover:scale-125 hover:text-primary hover:border-primary/50 hover:shadow-lg hover:shadow-primary/30 relative overflow-hidden group/btn"
                onClick={() => window.open(linkedIn, '_blank')}
                data-testid="button-linkedin"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                <Linkedin className="h-5 w-5 relative z-10" />
              </Button>
            )}
            {telegram && (
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:bg-primary/10 hover:scale-125 hover:text-primary hover:border-primary/50 hover:shadow-lg hover:shadow-primary/30 relative overflow-hidden group/btn"
                onClick={() => window.open(telegram, '_blank')}
                data-testid="button-telegram"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                <Send className="h-5 w-5 relative z-10" />
              </Button>
            )}
            {instagram && (
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full bg-background/50 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:bg-primary/10 hover:scale-125 hover:text-primary hover:border-primary/50 hover:shadow-lg hover:shadow-primary/30 relative overflow-hidden group/btn"
                onClick={() => window.open(instagram, '_blank')}
                data-testid="button-instagram"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                <Instagram className="h-5 w-5 relative z-10" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

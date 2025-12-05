import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Send, Instagram, Star, ArrowRight } from "lucide-react";
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

export function TeacherCard({
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
    <Card className="group hover-elevate overflow-hidden flex flex-col h-full relative border-2 transition-all duration-300 hover:border-primary/20 hover:shadow-xl">
      {isFeatured && (
        <div className="absolute top-4 right-4 z-10 rounded-full bg-gradient-to-br from-primary to-primary/80 backdrop-blur-sm shadow-lg p-2.5 text-primary-foreground animate-pulse">
          <Star className="h-4 w-4 fill-current" />
        </div>
      )}
      <CardContent className="pt-8 space-y-5 flex-1">
        <div className="flex flex-col items-center text-center gap-4">
          {imageUrl ? (
            <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg transition-all duration-300 group-hover:border-primary/40 group-hover:scale-105 group-hover:shadow-xl">
              <img 
                src={imageUrl} 
                alt={name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  // Agar rasm yuklanmasa, fallback ko'rsatish
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<div class="h-28 w-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg">${initials}</div>`;
                }}
              />
            </div>
          ) : (
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              {initials}
            </div>
          )}
          <div className="space-y-1">
            <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300" data-testid="text-teacher-name">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">{specialty}</p>
          </div>
          <Badge variant="secondary" className="px-3 py-1 transition-all duration-300 group-hover:scale-105" data-testid="badge-experience">
            {experience} {t("teachers.experience")}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground text-center line-clamp-3 leading-relaxed px-2">
          {bio}
        </p>

        {(linkedIn || telegram || instagram) && (
          <div className="flex items-center justify-center gap-3 pt-3">
            {linkedIn && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full transition-all duration-300 hover:bg-primary/10 hover:scale-110 hover:text-primary"
                onClick={() => window.open(linkedIn, '_blank')}
                data-testid="button-linkedin"
              >
                <Linkedin className="h-5 w-5" />
              </Button>
            )}
            {telegram && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full transition-all duration-300 hover:bg-primary/10 hover:scale-110 hover:text-primary"
                onClick={() => window.open(telegram, '_blank')}
                data-testid="button-telegram"
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
            {instagram && (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full transition-all duration-300 hover:bg-primary/10 hover:scale-110 hover:text-primary"
                onClick={() => window.open(instagram, '_blank')}
                data-testid="button-instagram"
              >
                <Instagram className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4">
        <Button variant="outline" className="w-full group/btn transition-all duration-300 hover:scale-105 hover:border-primary" data-testid="button-view-teacher">
          {t("teachers.viewProfile")}
          <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}

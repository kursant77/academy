import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Testimonial {
  id: string;
  name: string;
  course: string;
  text: string;
  rating?: number;
}

interface TestimonialSliderProps {
  testimonials: Testimonial[];
}

export function TestimonialSlider({ testimonials }: TestimonialSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const previous = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (testimonials.length <= 1) return; // Don't auto-advance if only one testimonial
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length, next]);

  const current = testimonials[currentIndex];

  if (!current) return null;

  const initials = current.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative max-w-4xl mx-auto">
      <Card className="overflow-hidden border-2 border-border/50 bg-card/50 backdrop-blur-sm relative group">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        </div>

        <CardContent className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col items-center text-center gap-6 animate-fade-in">
            <div className="relative">
              <Quote className="h-12 w-12 text-primary/20 animate-pulse" />
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            
            <p className="text-lg md:text-xl text-foreground italic max-w-2xl leading-relaxed group-hover:text-foreground/90 transition-colors duration-300" data-testid="text-testimonial">
              "{current.text}"
            </p>

            <div className="flex flex-col items-center gap-3 pt-2">
              <div className="relative group/avatar">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary via-primary/90 to-accent flex items-center justify-center text-lg font-bold text-primary-foreground shadow-xl transition-all duration-500 group-hover/avatar:scale-110 group-hover/avatar:shadow-primary/30 relative z-10">
                  {initials}
                </div>
              </div>
              <div>
                <div className="font-semibold text-lg group-hover:text-primary transition-colors duration-300" data-testid="text-student-name">
                  {current.name}
                </div>
                <div className="text-sm text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">{current.course}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={previous}
          data-testid="button-previous"
          className="transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/30 hover:bg-primary/10 hover:border-primary/50"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 hover:scale-125 ${
                index === currentIndex 
                  ? "w-8 bg-gradient-to-r from-primary to-primary/80 shadow-md shadow-primary/30" 
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              data-testid={`indicator-${index}`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={next}
          data-testid="button-next"
          className="transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary/30 hover:bg-primary/10 hover:border-primary/50"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

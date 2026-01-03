import { Link } from "wouter";
import { useState } from "react";

interface LogoProps {
  variant?: "header" | "footer" | "admin";
  showText?: boolean;
  className?: string;
  linkTo?: string;
}

export function Logo({
  variant = "header",
  showText = true,
  className = "",
  linkTo = "/",
}: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    header: "h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10",
    footer: "h-10 w-10 sm:h-12 sm:w-12",
    admin: "h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10"
  };

  const textSizeClasses = {
    header: "text-base sm:text-lg md:text-xl",
    footer: "text-xl sm:text-2xl",
    admin: "text-sm sm:text-base"
  };

  const iconSizeClasses = {
    header: "text-xs sm:text-sm md:text-lg",
    footer: "text-lg sm:text-xl",
    admin: "text-[10px] sm:text-xs md:text-sm"
  };

  const LogoIcon = () => (
    <div
      className={`
        ${sizeClasses[variant]}
        relative
        rounded-xl
        bg-gradient-to-br 
        from-[#ffd700] 
        via-[#ffae00] 
        to-[#ffd700]
        flex 
        items-center 
        justify-center 
        text-black 
        font-bold 
        tracking-tight
        shadow-lg
        transition-all 
        duration-500
        group-hover:shadow-2xl 
        group-hover:shadow-primary/50
        group-hover:scale-110
        overflow-hidden
        ${isHovered ? "animate-pulse" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />

      {/* Glow effect */}
      <div className="absolute inset-0 bg-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />

      {/* Animated border */}
      <div className="absolute inset-0 rounded-xl border-2 border-primary/0 group-hover:border-primary/50 transition-all duration-500" />

      {/* Rotating gradient ring */}
      <div className="absolute inset-[-2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className="absolute inset-0 rounded-xl animate-spin-slow"
          style={{
            background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--primary)) 90deg, transparent 90deg, transparent 360deg)'
          }}
        />
      </div>

      {/* Text with glow */}
      <span
        className={`
        ${iconSizeClasses[variant]}
        relative z-10
        drop-shadow-lg
        group-hover:drop-shadow-2xl
        transition-all duration-300
        ${isHovered ? 'scale-110' : 'scale-100'}
        font-black
      `}>
        II
      </span>
    </div>
  );

  const LogoText = () => (
    <span
      className={`
      ${textSizeClasses[variant]}
      font-bold
      relative
      bg-gradient-to-r 
      from-foreground 
      via-primary 
      to-foreground
      bg-clip-text 
      text-transparent 
      bg-[length:200%_auto]
      group-hover:animate-gradient
      transition-all 
      duration-500
      group-hover:scale-105
    `}>
      {"IELTS Imperia"}
      {/* Text glow effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
    </span>
  );

  const content = (
    <div
      className={`
        flex 
        items-center 
        gap-1.5 
        sm:gap-2 
        md:gap-2.5
        group
        transition-all 
        duration-300
        justify-start
        ${className}
      `}
      style={{ transform: "rotate(-1deg)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* Glowing ring */}
      <div className="absolute inset-[-1px] rounded-xl bg-[#ffd700] opacity-0 group-hover:opacity-20 blur-sm transition-opacity duration-500" />
      {showText && <LogoText />}
    </div>
  );

  if (linkTo && variant !== "admin") {
    return (
      <Link
        href={linkTo}
        className="hover-elevate rounded-lg px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 transition-all duration-300 hover:scale-105"
      >
        {content}
      </Link>
    );
  }

  return content;
}

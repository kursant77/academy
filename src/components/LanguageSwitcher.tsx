import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { useState, useEffect } from "react";

export function LanguageSwitcher() {
  const { i18n, ready } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language || 'uz');

  const languages = [
    { code: "uz", label: "O'zbekcha", flag: "🇺🇿" },
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "en", label: "English", flag: "🇬🇧" },
  ];

  // Listen to language changes
  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLang(lng);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    
    // Set initial language from localStorage if available
    const savedLang = localStorage.getItem('language');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang).catch(console.error);
    }

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);

  // Update current language when i18n.language changes
  useEffect(() => {
    if (i18n.language && i18n.language !== currentLang) {
      setCurrentLang(i18n.language);
    }
  }, [i18n.language, currentLang]);

  const currentLanguage = languages.find((lang) => lang.code === currentLang) || languages[0];

  const changeLanguage = async (code: string) => {
    try {
      await i18n.changeLanguage(code);
      localStorage.setItem("language", code);
      setCurrentLang(code);
      // Force a small delay to ensure state updates
      setTimeout(() => {
        window.dispatchEvent(new Event('languagechange'));
      }, 100);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  if (!ready) {
    return (
      <Button variant="ghost" size="sm" className="gap-2" disabled>
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">...</span>
        <span className="sm:hidden">...</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" data-testid="button-language">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.label}</span>
          <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`gap-2 ${currentLang === lang.code ? 'bg-primary/10' : ''}`}
            data-testid={`option-language-${lang.code}`}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
            {currentLang === lang.code && <span className="ml-auto text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

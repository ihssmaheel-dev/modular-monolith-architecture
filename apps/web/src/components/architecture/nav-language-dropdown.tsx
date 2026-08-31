import { Globe, Check } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { useLocaleStore } from "@/stores/locale.store";
import { useTranslation } from "react-i18next";
import type { Locale } from "@repo/i18n";

const languages: { code: Locale; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "US" },
  { code: "es", label: "Español", flag: "ES" },
  { code: "fr", label: "Français", flag: "FR" },
];

export function NavLanguageDropdown() {
  const { i18n } = useTranslation();
  const currentLocale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  const handleLanguageChange = (code: Locale) => {
    setLocale(code);
    i18n.changeLanguage(code);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-8" aria-label="Select Language" />
        }
      >
        <Globe className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{lang.flag}</span>
              <span className="text-xs">{lang.label}</span>
            </span>
            {currentLocale === lang.code && <Check className="size-3.5 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

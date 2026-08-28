import { Moon, Sun } from "lucide-react";
import { Button } from "@repo/ui";
import { useTheme } from "@/hooks/use-theme";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t("settings.switchTheme")} className="h-8 w-8 rounded-lg">
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{theme}</span>
    </Button>
  );
}

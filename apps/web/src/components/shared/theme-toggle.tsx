import { useTheme } from "@/hooks/use-theme";
import { Button } from "@repo/ui";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={t("settings.switchTheme", {
        theme: t(theme === "light" ? "settings.darkMode" : "settings.lightMode"),
      })}
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}

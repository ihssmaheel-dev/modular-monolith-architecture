import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@repo/ui";
import { Menu, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";

export function Header() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();

  const handleLogout = async () => {
    try {
      await api.auth.logout({});
    } catch {
      // Ignore network errors — clear local state regardless
    }
    logout();
  };

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">{t("dashboard.title")}</h1>
      </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <span className="text-sm text-muted-foreground">{user?.email}</span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {t("auth.logout")}
        </Button>
      </div>
    </header>
  );
}

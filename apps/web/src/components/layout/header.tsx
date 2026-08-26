import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@repo/ui";
import { Menu, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { useTenantStore } from "@/stores/tenant.store";
import { TenantSwitcher } from "./tenant-switcher";
import { queryClient } from "@/lib/query-client";

export function Header() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const clearTenant = useTenantStore((state) => state.clearTenant);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors — clear local state regardless
    }
    clearTenant();
    queryClient.clear();
    logout();
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 select-none sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden">
          <Menu className="h-5 w-5 text-foreground" />
        </Button>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground block">
            Workspace
          </span>
          <h1 className="text-sm font-semibold tracking-tight text-foreground">
            {t("dashboard.title")}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <TenantSwitcher />
        <div className="h-4 w-px bg-border mx-1" />
        <ThemeToggle />
        <div className="flex items-center gap-2 px-2 py-1 rounded-sm bg-secondary text-foreground text-xs font-medium">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="max-w-[140px] truncate">{user?.email}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="text-xs">
          <LogOut className="mr-1.5 h-3.5 w-3.5" />
          {t("auth.logout")}
        </Button>
      </div>
    </header>
  );
}

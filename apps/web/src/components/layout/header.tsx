import { useLocation } from "@tanstack/react-router";
import { useUIStore } from "@/stores/ui.store";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button, Separator } from "@repo/ui";
import { PanelLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TenantSwitcher } from "./tenant-switcher";

export function Header() {
  const { t } = useTranslation();
  const { toggleSidebar } = useUIStore();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === "/notes") return t("notes.title");
    if (location.pathname === "/users") return t("users.title");
    if (location.pathname === "/settings") return t("settings.title");
    return t("dashboard.title");
  };

  return (
    <header className="flex h-12 items-center justify-between border-b border-border bg-card/60 backdrop-blur-xs px-4 select-none sticky top-0 z-40">
      <div className="flex items-center gap-2.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          title="Toggle Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-muted-foreground">Platform</span>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="font-semibold text-foreground">{getPageTitle()}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="lg:hidden">
          <TenantSwitcher />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

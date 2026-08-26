import { useUIStore } from "@/stores/ui.store";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@repo/ui";
import { Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TenantSwitcher } from "./tenant-switcher";

export function Header() {
  const { t } = useTranslation();
  const { toggleSidebar } = useUIStore();

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-xs px-6 select-none sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="lg:hidden h-8 w-8">
          <Menu className="h-4 w-4 text-foreground" />
        </Button>
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground block">
            Workspace
          </span>
          <h1 className="text-xs font-semibold tracking-tight text-foreground">
            {t("dashboard.title")}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="lg:hidden">
          <TenantSwitcher />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

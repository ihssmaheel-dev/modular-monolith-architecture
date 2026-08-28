import { useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Search, Command } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { TenantSwitcher } from "@/components/layout/tenant-switcher";
import {
  SidebarTrigger,
  Separator,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Input,
} from "@repo/ui";

export function Header() {
  const { t } = useTranslation();
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === "/notes") return t("notes.title");
    if (location.pathname === "/users") return t("users.title");
    if (location.pathname === "/settings") return t("settings.title");
    return t("dashboard.title");
  };

  const getPageDesc = () => {
    if (location.pathname === "/notes") return "Manage tenant-scoped content";
    if (location.pathname === "/users") return "Identity and access";
    if (location.pathname === "/settings") return "Preferences and system";
    return "Overview and insights";
  };

  return (
    <header className="sticky top-0 z-30 flex h-[56px] shrink-0 items-center justify-between gap-4 border-b border-border bg-background/85 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <SidebarTrigger className="size-8 -ml-1 shrink-0 border border-transparent hover:border-border hover:bg-muted/50 transition-colors" />
        <Separator orientation="vertical" className="h-5 hidden sm:block" />
        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
                Workspace
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold tracking-tight text-sm flex items-center gap-2">
                {getPageTitle()}
                <span className="hidden md:inline-flex text-xs font-normal text-muted-foreground">— {getPageDesc()}</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="sm:hidden min-w-0">
          <p className="text-sm font-semibold tracking-tight truncate">{getPageTitle()}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden lg:flex items-center relative mr-1">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search…"
            className="h-8 w-[220px] pl-8 pr-12 text-xs bg-muted/40 border-border/60 placeholder:text-muted-foreground/60 focus:bg-background focus:border-primary/20 focus:ring-primary/20"
          />
          <kbd className="pointer-events-none absolute right-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <Command className="h-3 w-3" /> K
          </kbd>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <TenantSwitcher />
          <Separator orientation="vertical" className="h-5" />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}

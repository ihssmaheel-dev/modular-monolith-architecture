import { useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
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

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="size-8 -ml-1 text-muted-foreground hover:text-foreground hover:bg-accent" />
        <Separator orientation="vertical" className="h-5" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden sm:block">
              <BreadcrumbLink href="/" className="text-xs font-medium tracking-wide uppercase text-muted-foreground hover:text-foreground transition-colors">
                Platform
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold tracking-tight">{getPageTitle()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 mr-2">
          <TenantSwitcher />
        </div>
        <Separator orientation="vertical" className="h-5 hidden sm:block" />
        <ThemeToggle />
      </div>
    </header>
  );
}

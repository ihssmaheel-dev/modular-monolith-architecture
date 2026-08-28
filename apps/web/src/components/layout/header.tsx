import { useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/shared/theme-toggle";
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
  const { pathname } = useLocation();

  const title =
    pathname === "/notes"
      ? t("notes.title")
      : pathname === "/users"
        ? t("users.title")
        : pathname === "/settings"
          ? t("settings.title")
          : t("dashboard.title");

  const description =
    pathname === "/notes"
      ? t("notes.description")
      : pathname === "/users"
        ? t("users.manage")
        : pathname === "/settings"
          ? t("settings.description")
          : t("dashboard.subtitle", { defaultValue: "Modular monolith overview" });

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl">
      <div className="flex items-center gap-3 min-w-0">
        <SidebarTrigger className="size-8 -ml-1" />
        <Separator orientation="vertical" className="h-5 hidden sm:block" />
        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-[11px] tracking-widest uppercase text-muted-foreground">
                {t("common.appName")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold tracking-tight">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="sm:hidden">
          <p className="text-sm font-semibold truncate">{title}</p>
          <p className="text-xs text-muted-foreground truncate hidden xs:block">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}

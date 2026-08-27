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
  const location = useLocation();

  const getPageTitle = () => {
    if (location.pathname === "/notes") return t("notes.title");
    if (location.pathname === "/users") return t("users.title");
    if (location.pathname === "/settings") return t("settings.title");
    return t("dashboard.title");
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-border px-4 select-none sticky top-0 z-40 bg-background">
      <div className="flex items-center gap-2 px-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">Platform</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{getPageTitle()}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}

import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Building2,
  ChevronRight,
  FilePlus2,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Settings,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/ui/sidebar";

export function AppSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const primary = [
    [t("dashboard.title"), LayoutDashboard, "/dashboard"],
    [t("notes.title"), FileText, "/notes"],
    [t("notes.newNote"), FilePlus2, "/notes/new"],
    [t("settings.title"), Settings, "/settings"],
  ] as const;
  const future = [
    [t("users.title"), Users],
    [t("tenancy.organization"), Building2],
    [t("architecture.security"), ShieldCheck],
  ] as const;
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex h-12 items-center gap-2 px-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <BookOpen className="size-4" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">{t("common.appName")}</p>
            <p className="truncate text-xs text-sidebar-foreground/60">{t("home.platformBadge")}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation.workspace")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map(([label, Icon, to]) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton
                    render={<Link to={to} />}
                    isActive={location.pathname === to || location.pathname.startsWith(`${to}/`)}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("navigation.comingSoon")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {future.map(([label, Icon]) => (
                <SidebarMenuItem key={label}>
                  <SidebarMenuButton disabled tooltip={label}>
                    <Icon />
                    <span>{label}</span>
                    <ChevronRight className="ms-auto size-3 opacity-50" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link to="/" />} tooltip={t("navigation.architecture")}>
              <BookOpen />
              <span>{t("navigation.architecture")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

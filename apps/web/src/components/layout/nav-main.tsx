import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, FileText, Users, Settings2, type LucideIcon } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@repo/ui";
import { Can } from "@/components/shared/Can";
import type { Permission } from "@repo/authorization";

interface Item {
  titleKey: string;
  url: string;
  icon: LucideIcon;
  permission?: Permission;
}

const items: Item[] = [
  { titleKey: "dashboard.title", url: "/", icon: LayoutDashboard },
  { titleKey: "notes.title", url: "/notes", icon: FileText, permission: "notes:read" },
  { titleKey: "users.title", url: "/users", icon: Users, permission: "users:read" },
  { titleKey: "settings.title", url: "/settings", icon: Settings2 },
];

export function NavMain() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] tracking-widest uppercase text-sidebar-foreground/60 px-2">Platform</SidebarGroupLabel>
      <SidebarMenu className="gap-1 px-1">
        {items.map((it) => {
          const active = it.url === "/" ? pathname === "/" : pathname.startsWith(it.url);
          const label = t(it.titleKey);
          const Icon = it.icon;
          const node = (
            <SidebarMenuButton asChild isActive={active} tooltip={label} className="h-8 gap-2.5 font-medium data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground">
              <Link to={it.url}>
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            </SidebarMenuButton>
          );
          return <SidebarMenuItem key={it.url}>{it.permission ? <Can do={it.permission}>{node}</Can> : node}</SidebarMenuItem>;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings2,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui";
import { Can } from "@/components/shared/Can";
import type { Permission } from "@repo/authorization";

export interface NavMainItem {
  titleKey: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  permission?: Permission;
  items?: {
    title: string;
    url: string;
  }[];
}

const defaultNavItems: NavMainItem[] = [
  {
    titleKey: "dashboard.title",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    titleKey: "notes.title",
    url: "/notes",
    icon: FileText,
    permission: "notes:read",
  },
  {
    titleKey: "users.title",
    url: "/users",
    icon: Users,
    permission: "users:read",
  },
  {
    titleKey: "settings.title",
    url: "/settings",
    icon: Settings2,
  },
];

export function NavMain({ items = defaultNavItems }: { items?: NavMainItem[] }) {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[11px] font-semibold tracking-widest uppercase text-sidebar-foreground/60 px-2">
        Platform
      </SidebarGroupLabel>
      <SidebarMenu className="gap-1 px-1">
        {items.map((item) => {
          const isActive =
            item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
          const title = t(item.titleKey);
          const Icon = item.icon ?? Terminal;
          const content = (
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={title}
              className="h-8 gap-2.5 font-medium data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground hover:bg-sidebar-accent/60"
            >
              <Link to={item.url}>
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{title}</span>
              </Link>
            </SidebarMenuButton>
          );
          return (
            <SidebarMenuItem key={item.url}>
              {item.permission ? <Can do={item.permission}>{content}</Can> : content}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ChevronRight,
  LayoutDashboard,
  FileText,
  Users,
  Settings2,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
    isActive: true,
    items: [
      { title: "Overview", url: "/" },
      { title: "Telemetry", url: "/" },
    ],
  },
  {
    titleKey: "notes.title",
    url: "/notes",
    icon: FileText,
    permission: "notes:read",
    items: [
      { title: "All Notes", url: "/notes" },
      { title: "Create Note", url: "/notes" },
    ],
  },
  {
    titleKey: "users.title",
    url: "/users",
    icon: Users,
    permission: "users:read",
    items: [
      { title: "Team Members", url: "/users" },
      { title: "Permissions", url: "/users" },
    ],
  },
  {
    titleKey: "settings.title",
    url: "/settings",
    icon: Settings2,
    items: [
      { title: "General", url: "/settings" },
      { title: "Appearance", url: "/settings" },
      { title: "Billing", url: "/settings" },
    ],
  },
];

export function NavMain({ items = defaultNavItems }: { items?: NavMainItem[] }) {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isItemActive =
            item.url === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.url);

          const title = t(item.titleKey);
          const Icon = item.icon ?? Terminal;

          const menuContent = (
            <Collapsible
              key={item.url}
              asChild
              defaultOpen={item.isActive || isItemActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={title} isActive={isItemActive}>
                    {Icon && <Icon className="size-4" />}
                    <span>{title}</span>
                    <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      const isSubActive =
                        subItem.url === "/"
                          ? location.pathname === "/"
                          : location.pathname === subItem.url;

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild isActive={isSubActive}>
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );

          return item.permission ? (
            <Can key={item.url} do={item.permission}>
              {menuContent}
            </Can>
          ) : (
            menuContent
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

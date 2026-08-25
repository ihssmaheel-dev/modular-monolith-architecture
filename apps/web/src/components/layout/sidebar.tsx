import { Link, useLocation } from "@tanstack/react-router";
import { useUIStore } from "@/stores/ui.store";
import { LayoutDashboard, Users, Settings, FileText, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Can } from "@/components/shared/Can";
import type { Permission } from "@repo/shared";

interface NavItem {
  to: "/" | "/users" | "/notes" | "/settings";
  labelKey: string;
  icon: LucideIcon;
  permission?: Permission;
}

const navItems: readonly NavItem[] = [
  { to: "/", labelKey: "dashboard.title", icon: LayoutDashboard },
  { to: "/users", labelKey: "users.title", icon: Users, permission: "users:read" },
  { to: "/notes", labelKey: "notes.title", icon: FileText, permission: "notes:read" },
  { to: "/settings", labelKey: "settings.title", icon: Settings },
];

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { sidebarOpen } = useUIStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
      <div className="flex h-14 items-center border-b px-4">
        <Link to="/" className="text-lg font-semibold">
          {t("common.appName")}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          const link = (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );

          if (item.permission) {
            return (
              <Can key={item.to} do={item.permission}>
                {link}
              </Can>
            );
          }

          return link;
        })}
      </nav>
    </aside>
  );
}

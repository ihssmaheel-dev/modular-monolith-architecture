import { Link, useLocation } from "@tanstack/react-router";
import { useUIStore } from "@/stores/ui.store";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  Activity,
  ShieldCheck,
  Building2,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Can } from "@/components/shared/Can";
import type { Permission } from "@repo/authorization";
import { Badge } from "@repo/ui";
import { TenantSwitcher } from "./tenant-switcher";
import { NavUser } from "./nav-user";

interface NavItem {
  to: "/" | "/users" | "/notes" | "/settings";
  labelKey: string;
  icon: LucideIcon;
  permission?: Permission;
}

const navItems: readonly NavItem[] = [
  { to: "/", labelKey: "dashboard.title", icon: LayoutDashboard },
  { to: "/notes", labelKey: "notes.title", icon: FileText, permission: "notes:read" },
  { to: "/users", labelKey: "users.title", icon: Users, permission: "users:read" },
  { to: "/settings", labelKey: "settings.title", icon: Settings },
];

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { sidebarOpen } = useUIStore();

  if (!sidebarOpen) return null;

  return (
    <aside className="hidden w-64 flex-col border-r border-border bg-card lg:flex select-none">
      {/* 1. Header: Team & Workspace Switcher (sidebar-07) */}
      <div className="flex flex-col border-b border-border p-3 gap-2">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs shadow-xs shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold tracking-tight text-foreground block truncate">
              {t("common.appName")}
            </span>
            <span className="text-[10px] text-muted-foreground block truncate font-medium">
              Enterprise Monolith
            </span>
          </div>
        </div>
        <div className="px-1">
          <TenantSwitcher />
        </div>
      </div>

      {/* 2. Main Nav Groups (sidebar-07) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
            Platform
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname === item.to || location.pathname.startsWith(item.to + "/");
              const Icon = item.icon;
              const link = (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary font-semibold shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="truncate">{t(item.labelKey)}</span>
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
        </div>

        {/* System & Architecture Section */}
        <div>
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
            Architecture
          </div>
          <div className="space-y-1">
            <a
              href="/api/docs"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Activity className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>Scalar API Docs</span>
            </a>
            <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground font-medium bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-xs">FGA Engine</span>
              </div>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">Active</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Footer: User Profile Card (NavUser in sidebar-07) */}
      <NavUser />
    </aside>
  );
}

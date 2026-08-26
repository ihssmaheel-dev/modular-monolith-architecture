import { Link, useLocation } from "@tanstack/react-router";
import { useUIStore } from "@/stores/ui.store";
import { LayoutDashboard, Users, Settings, FileText, Activity, ShieldCheck, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Can } from "@/components/shared/Can";
import type { Permission } from "@repo/authorization";

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
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-border px-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary text-primary-foreground font-semibold text-xs tracking-tight shadow-sm">
            MM
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-foreground block">
              {t("common.appName")}
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Section */}
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
                  className={`flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-all ${
                    isActive
                      ? "bg-secondary text-foreground font-semibold border-l-2 border-primary shadow-xs pl-2.5"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground font-medium"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span>{t(item.labelKey)}</span>
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
              className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/60 hover:text-foreground font-medium transition-all"
            >
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span>Scalar API Docs</span>
            </a>
            <div className="flex items-center gap-3 rounded-sm px-3 py-2 text-sm text-muted-foreground font-medium">
              <ShieldCheck className="h-4 w-4 text-[#00d722]" />
              <span className="text-xs text-muted-foreground">FGA Engine Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Enterprise Starter</span>
          <span className="font-mono text-[10px] text-muted-foreground/80">v2.0.0</span>
        </div>
      </div>
    </aside>
  );
}

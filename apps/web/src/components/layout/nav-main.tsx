import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, FileText, Users, Settings, ChevronRight, type LucideIcon } from "lucide-react";
import { Can } from "@/components/shared/Can";
import type { Permission } from "@repo/authorization";

interface NavGroupItem {
  titleKey: string;
  url: string;
  icon: LucideIcon;
  permission?: Permission;
  items: { title: string; url: string }[];
}

const navItems: NavGroupItem[] = [
  {
    titleKey: "dashboard.title",
    url: "/",
    icon: LayoutDashboard,
    items: [{ title: "Overview", url: "/" }, { title: "Telemetry", url: "/" }],
  },
  {
    titleKey: "notes.title",
    url: "/notes",
    icon: FileText,
    permission: "notes:read",
    items: [{ title: "All Notes", url: "/notes" }, { title: "Create Note", url: "/notes" }],
  },
  {
    titleKey: "users.title",
    url: "/users",
    icon: Users,
    permission: "users:read",
    items: [{ title: "User List", url: "/users" }, { title: "Permissions", url: "/users" }],
  },
  {
    titleKey: "settings.title",
    url: "/settings",
    icon: Settings,
    items: [{ title: "General", url: "/settings" }, { title: "Appearance", url: "/settings" }],
  },
];

export function NavMain({ collapsed }: { collapsed?: boolean }) {
  const { t } = useTranslation();
  const location = useLocation();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ dashboard: true, notes: true });
  const toggleGroup = (key: string) => setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-1">
      {!collapsed && (
        <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-muted-foreground/80">
          Platform
        </div>
      )}
      <div className="space-y-1">
        {navItems.map((item) => {
          const key = item.url.replace("/", "") || "dashboard";
          const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
          const isOpen = openItems[key] ?? isActive;
          const Icon = item.icon;

          const content = (
            <div key={item.url} className="space-y-1">
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleGroup(key)}
                onKeyDown={(e) => e.key === "Enter" && toggleGroup(key)}
                className={`group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer select-none ${
                  isActive ? "text-foreground font-semibold bg-muted/60" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  {!collapsed && <span className="truncate">{t(item.titleKey)}</span>}
                </div>
                {!collapsed && (
                  <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground/70 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                )}
              </div>

              {!collapsed && isOpen && (
                <div className="ml-5 border-l border-border/60 pl-3 space-y-1 pt-0.5">
                  {item.items.map((subItem) => (
                    <Link
                      key={subItem.title}
                      to={subItem.url}
                      className="block rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );

          return item.permission ? (
            <Can key={item.url} do={item.permission}>
              {content}
            </Can>
          ) : (
            content
          );
        })}
      </div>
    </div>
  );
}

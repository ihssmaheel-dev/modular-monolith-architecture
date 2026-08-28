import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ChevronsUpDown, LogOut, Settings, Sparkles } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { queryClient } from "@/lib/query-client";
import { api } from "@/lib/api";

export function NavUser() {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const { user, logout } = useAuthStore();
  const clearTenant = useTenantStore((s) => s.clearTenant);
  const initials = (user?.name || user?.email || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const onLogout = async () => {
    try {
      await api.auth.logout();
    } catch {}
    clearTenant();
    queryClient.clear();
    logout();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage alt={user?.name || "User"} />
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name || "User"}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-60" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side={isMobile ? "bottom" : "right"} sideOffset={4} className="w-56 rounded-xl">
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage alt={user?.name || "User"} />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left">
                  <span className="truncate font-semibold text-sm">{user?.name || "User"}</span>
                  <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <Sparkles className="size-4 text-amber-500" /> Enterprise
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="gap-2">
              <Link to="/settings">
                <Settings className="size-4" /> {t("settings.title")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout} className="gap-2 text-destructive focus:text-destructive">
              <LogOut className="size-4" /> {t("auth.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

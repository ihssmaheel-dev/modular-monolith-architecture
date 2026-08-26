import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { queryClient } from "@/lib/query-client";
import { api } from "@/lib/api";
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from "@repo/ui";
import { ChevronsUpDown, LogOut, Sparkles, User, Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function NavUser({ collapsed }: { collapsed?: boolean }) {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const clearTenant = useTenantStore((state) => state.clearTenant);

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch {
      // Ignore network errors
    }
    clearTenant();
    queryClient.clear();
    logout();
  };

  const userInitials = (user?.name || user?.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="border-t border-border p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left text-sm transition-colors hover:bg-muted/60 focus-visible:outline-hidden"
          >
            <Avatar className="h-8 w-8 rounded-lg shrink-0">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {user?.name || "User"}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56">
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-2 py-1.5 text-left text-xs">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-xs">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-semibold">{user?.name || "User"}</span>
                <span className="truncate text-[10px] text-muted-foreground">{user?.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="gap-2 text-xs cursor-pointer">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Enterprise Edition</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
              <Link to="/settings">
                <User className="h-4 w-4" />
                <span>{t("settings.profile")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                <span>{t("settings.title")}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="gap-2 text-xs cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>{t("auth.logout")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

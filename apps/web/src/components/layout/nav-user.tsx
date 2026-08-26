import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth.store";
import { useTenantStore } from "@/stores/tenant.store";
import { queryClient } from "@/lib/query-client";
import { api } from "@/lib/api";
import { Avatar, AvatarFallback, Button } from "@repo/ui";
import { LogOut } from "lucide-react";

export function NavUser() {
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
    <div className="border-t border-border p-3">
      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/40 p-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground truncate leading-tight">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-muted-foreground truncate leading-tight">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          title={t("auth.logout")}
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

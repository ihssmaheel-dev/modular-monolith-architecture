import { createFileRoute, Navigate, Outlet, useSearch, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";
import type { InvitationSearch } from "@/lib/invitation-search";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Building2 } from "lucide-react";

function AuthLayout() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { invitationToken } = useSearch({ strict: false }) as InvitationSearch;

  if (isAuthenticated) {
    if (invitationToken) {
      return <Navigate to="/accept-invitation" search={{ token: invitationToken }} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted/40 p-6 md:p-10 select-none">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link to="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-xs">
            <Building2 className="size-4" />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            {t("common.appName")}
          </span>
        </Link>
        <Outlet />
      </div>
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

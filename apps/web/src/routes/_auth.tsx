import { createFileRoute, Navigate, Outlet, useSearch, Link } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";
import type { InvitationSearch } from "@/lib/invitation-search";
import { useTranslation } from "react-i18next";

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
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground font-semibold text-xs shadow-sm">
              MM
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              {t("common.appName")}
            </span>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

import { createFileRoute, Navigate, Outlet, useSearch } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth.store";
import type { InvitationSearch } from "@/lib/invitation-search";

function AuthLayout() {
  const { isAuthenticated } = useAuthStore();
  const { invitationToken } = useSearch({ strict: false }) as InvitationSearch;

  if (isAuthenticated) {
    if (invitationToken) {
      return <Navigate to="/accept-invitation" search={{ token: invitationToken }} replace />;
    }
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

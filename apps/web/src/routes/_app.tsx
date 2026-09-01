import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { FRONTEND_ROUTES } from "@repo/contracts";
import { useAuthStore } from "@/stores/auth.store";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    if (!useAuthStore.getState().user) throw redirect({ to: FRONTEND_ROUTES.auth });
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

import { createFileRoute, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { FRONTEND_ROUTES } from "@repo/contracts";
import { useAuthStore } from "@/stores/auth.store";
import { AppShell } from "@/components/app-shell";
import { getApiClient } from "@/lib/api";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/_app")({
  beforeLoad: () => {
    // Sync guard after hydration: avoids rendering protected shell
    // when the persisted store already knows we are logged out.
    if (useAuthStore.getState().status === "unauthenticated") {
      throw redirect({ to: FRONTEND_ROUTES.auth, replace: true });
    }
  },
  component: ProtectedApp,
});

function ProtectedApp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const status = useAuthStore((state) => state.status);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (status !== "loading") return;
    let active = true;
    void getApiClient()
      .auth.me()
      .then((response) => {
        if (!active) return;
        if (response.status === 200 && response.body?.user) setUser(response.body.user);
        else clearAuth();
      })
      .catch(() => {
        if (active) clearAuth();
      });
    return () => {
      active = false;
    };
  }, [clearAuth, setUser, status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      void navigate({ to: FRONTEND_ROUTES.auth, replace: true });
    }
  }, [navigate, status]);

  if (status === "loading") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/20">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }
  if (status === "unauthenticated") return null;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

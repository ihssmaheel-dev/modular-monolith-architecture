import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function RootComponent() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.title = t("common.appName");
    document.documentElement.lang = i18n.resolvedLanguage ?? "en";
  }, [i18n.resolvedLanguage, t]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    </ErrorBoundary>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});

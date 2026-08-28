import { createRootRoute, Outlet } from "@tanstack/react-router";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function RootComponent() {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.resolvedLanguage ?? "en";
    document.documentElement.dir = i18n.dir(i18n.resolvedLanguage ?? "en");
  }, [i18n, i18n.resolvedLanguage]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
        <Outlet />
      </div>
    </ErrorBoundary>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
});

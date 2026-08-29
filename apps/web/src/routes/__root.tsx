import {
  createRootRouteWithContext,
  Outlet,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@repo/ui/components/ui/toast";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { QueryProvider } from "@/lib/query-client";
import { I18nProvider } from "@/lib/i18n";
import { useTranslation } from "react-i18next";
import "@repo/ui/globals.css";

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Modular Monolith — TanStack Start" },
    ],
    links: [{ rel: "icon", href: "/favicon.ico" }],
  }),
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootError,
  pendingComponent: RootPending,
});

function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-muted/20">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>{t("errors.notFound")}</CardTitle>
          <CardDescription>{t("errors.notFound")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link to="/" />} className="w-full">
            {t("common.back")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function RootError() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-svh items-center justify-center p-6 bg-muted/20">
      <Card className="max-w-md w-full border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">{t("errors.unexpected")}</CardTitle>
          <CardDescription>{t("errors.serverError")}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => window.location.reload()}>
            {t("common.retry")}
          </Button>
          <Button className="flex-1" render={<Link to="/" />}>
            {t("common.back")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function RootPending() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
    </div>
  );
}

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-svh bg-background font-sans antialiased isolation-auto">
        <QueryProvider>
          <I18nProvider>
            <ThemeProvider defaultTheme="system" storageKey="theme">
              <div id="root">
                <Outlet />
              </div>
              <Toaster />
              <TanStackRouterDevtools position="bottom-right" />
            </ThemeProvider>
          </I18nProvider>
        </QueryProvider>
        <Scripts />
      </body>
    </html>
  );
}

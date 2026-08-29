import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Badge } from "@repo/ui/components/ui/badge";
import { ArrowRight, Layers, Shield, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Layers className="size-4" />
            </div>
            <span className="font-semibold">{t("common.appName")}</span>
            <Badge variant="secondary" className="ml-2 hidden sm:inline-flex">
              {t("home.platformBadge")}
            </Badge>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link to="/auth" />}>
              {t("auth.login")}
            </Button>
            <Button size="sm" render={<Link to="/dashboard" />}>
              {t("dashboard.title")}
              <ArrowRight className="size-3.5" />
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto flex flex-1 flex-col px-4 py-10">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-4">
            {t("auth.heroTagline")}
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("auth.heroTagline")}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{t("auth.heroDescription")}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" render={<Link to="/dashboard" />}>
              {t("dashboard.title")}
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" size="lg" render={<Link to="/notes" />}>
              {t("notes.title")}
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-12 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">{t("home.routingTitle")}</CardTitle>
              <CardDescription>{t("home.routingDescription")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">{t("home.contractsTitle")}</CardTitle>
              <CardDescription>{t("home.contractsDescription")}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Layers className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base">{t("home.uiTitle")}</CardTitle>
              <CardDescription>{t("home.uiDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <kbd className="rounded border bg-muted px-1.5 py-0.5">d</kbd>
                {t("home.themeHint")}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mx-auto mt-10 flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <p>
            {t("home.apiLabel")}: {t("dashboard.subtitle")}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" render={<Link to="/auth" />}>
              {t("home.authFlow")}
            </Button>
            <Button variant="outline" size="sm" render={<Link to="/notes" />}>
              {t("home.notesSlice")}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

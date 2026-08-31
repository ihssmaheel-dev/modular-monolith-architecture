import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Sparkles,
  Terminal,
  Layers,
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";

export function ArchitectureHero() {
  const { t } = useTranslation();
  const signedIn = Boolean(useAuthStore((state) => state.user));

  const stats = [
    {
      label: t("architecture.hero.stats.packages"),
      value: "7 Packages",
      hint: "@repo/contracts, ui, i18n, etc.",
      icon: Layers,
    },
    {
      label: t("architecture.hero.stats.domains"),
      value: "5 Domains",
      hint: "Auth, Users, Tenancy, Notes, Files",
      icon: Cpu,
    },
    {
      label: t("architecture.hero.stats.tests"),
      value: "262 Passing",
      hint: "100% Deterministic Neverthrow",
      icon: CheckCircle2,
    },
    {
      label: t("architecture.hero.stats.violations"),
      value: "0 Boundary Leaks",
      hint: "Enforced via dependency-cruiser",
      icon: ShieldCheck,
    },
    {
      label: t("architecture.hero.stats.typeSafety"),
      value: "100% oRPC + Zod",
      hint: "Full contract compile safety",
      icon: Sparkles,
    },
    {
      label: t("architecture.hero.stats.tenancy"),
      value: "Zero-Trust CLS",
      hint: "Single & Multi Tenancy Mode",
      icon: Terminal,
    },
  ];

  return (
    <section className="w-full space-y-10 pt-6 sm:pt-12">
      <div className="flex flex-col items-start gap-4">
        <Badge
          variant="outline"
          className="gap-1.5 py-1 px-3 border-primary/40 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider"
        >
          <Sparkles className="size-3.5" />
          {t("architecture.hero.tag")}
        </Badge>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
          {t("architecture.hero.title")}
        </h1>
        <p className="text-muted-foreground text-lg sm:text-xl max-w-4xl leading-relaxed">
          {t("architecture.hero.subtitle")}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            size="lg"
            className="gap-2 font-medium shadow-md"
            render={<Link to={signedIn ? "/dashboard" : "/auth"} />}
          >
            <span>
              {signedIn ? t("architecture.hero.launchDashboard") : t("architecture.nav.signIn")}
            </span>
            <ArrowRight className="size-4" />
          </Button>

          <Button size="lg" variant="outline" className="gap-2" render={<a href="#lifecycle" />}>
            <BookOpen className="size-4 text-primary" />
            <span>{t("architecture.hero.exploreArchitecture")}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="border-muted/80 bg-background/60 backdrop-blur-xs shadow-xs hover:border-primary/50 transition-all"
            >
              <CardContent className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <Icon className="size-4 text-primary" />
                  <span className="text-[10px] font-mono text-muted-foreground">{stat.hint}</span>
                </div>
                <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

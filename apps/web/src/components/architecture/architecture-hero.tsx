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

const STATS_ICONS = [Layers, Cpu, CheckCircle2, ShieldCheck, Sparkles, Terminal] as const;
const STATS_VALUES = ["7", "5", "262", "0", "100%", "CLS"] as const;
const STATS_UNITS = [
  "Packages",
  "Domains",
  "Passing",
  "Violations",
  "Type Safe",
  "Zero-Trust",
] as const;
const STATS_KEYS = [
  "architecture.hero.stats.packages",
  "architecture.hero.stats.domains",
  "architecture.hero.stats.tests",
  "architecture.hero.stats.violations",
  "architecture.hero.stats.typeSafety",
  "architecture.hero.stats.tenancy",
] as const;

export function ArchitectureHero() {
  const { t } = useTranslation();
  const signedIn = Boolean(useAuthStore((s) => s.user));

  return (
    <section className="w-full space-y-12 pt-8 sm:pt-16">
      <div className="flex flex-col items-start gap-5 max-w-4xl">
        <Badge
          variant="outline"
          className="gap-1.5 py-1 px-3 border-primary/40 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider"
        >
          <Sparkles className="size-3.5" />
          {t("architecture.hero.tag")}
        </Badge>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.08]">
          <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            {t("architecture.hero.title")}
          </span>
        </h1>

        <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-3xl">
          {t("architecture.hero.subtitle")}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            size="lg"
            className="gap-2 font-medium shadow-md"
            render={<Link to={signedIn ? "/dashboard" : "/auth"} />}
          >
            {signedIn ? t("architecture.hero.launchDashboard") : t("architecture.nav.signIn")}
            <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="outline" className="gap-2" render={<a href="#lifecycle" />}>
            <BookOpen className="size-4 text-primary" />
            {t("architecture.hero.exploreArchitecture")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {STATS_ICONS.map((Icon, i) => (
          <Card
            key={STATS_KEYS[i]}
            className="group border-muted/60 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/40 transition-all duration-300"
          >
            <CardContent className="p-4 space-y-3">
              <span className="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {STATS_VALUES[i]}
                </p>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {STATS_UNITS[i]}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground/80">{t(STATS_KEYS[i])}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

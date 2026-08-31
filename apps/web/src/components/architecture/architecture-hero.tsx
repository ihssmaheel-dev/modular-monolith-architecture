import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, BookOpen, Sparkles, Shield, Cpu, Zap, Database } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";

export function ArchitectureHero() {
  const { t } = useTranslation();
  const signedIn = Boolean(useAuthStore((s) => s.user));

  const highlights = [
    { icon: Cpu, label: "CQRS Lite & Neverthrow" },
    { icon: Shield, label: "Fine-Grained Authorization (FGA)" },
    { icon: Zap, label: "Transactional Outbox Relay" },
    { icon: Database, label: "Zero-Trust Multi-Tenancy" },
  ];

  return (
    <section className="relative w-full pt-12 pb-6 sm:pt-20 sm:pb-10 flex flex-col items-center text-center">
      <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto">
        <Badge
          variant="outline"
          className="gap-2 py-1.5 px-4 rounded-full border-primary/30 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider backdrop-blur-xs shadow-xs"
        >
          <Sparkles className="size-3.5" />
          <span>{t("architecture.hero.tag")}</span>
        </Badge>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-foreground">
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
            {t("architecture.hero.title")}
          </span>
        </h1>

        <p className="text-muted-foreground text-base sm:text-xl leading-relaxed max-w-2xl font-normal">
          {t("architecture.hero.subtitle")}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            className="gap-2 font-medium h-11 px-6 shadow-md rounded-xl"
            render={<Link to={signedIn ? "/dashboard" : "/auth"} />}
          >
            <span>
              {signedIn ? t("architecture.hero.launchDashboard") : t("architecture.nav.signIn")}
            </span>
            <ArrowRight className="size-4" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="gap-2 font-medium h-11 px-6 rounded-xl border-muted/80 bg-background/50 backdrop-blur-xs"
            render={<a href="#lifecycle" />}
          >
            <BookOpen className="size-4 text-primary" />
            <span>{t("architecture.hero.exploreArchitecture")}</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
          {highlights.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-muted/60 bg-background/40 backdrop-blur-xs text-xs text-muted-foreground font-medium"
            >
              <Icon className="size-3.5 text-primary" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

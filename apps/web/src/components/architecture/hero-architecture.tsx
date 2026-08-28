import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Button, Badge } from "@repo/ui";
import { Building2, ArrowRight, Sparkles, Boxes, Layers } from "lucide-react";

export function HeroArchitecture() {
  const { t } = useTranslation();
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent-purple/5 pointer-events-none" />
      <div className="relative grid gap-8 p-6 md:p-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 text-primary gap-1.5">
              <Sparkles className="h-3 w-3" /> B12 Enterprise
            </Badge>
            <span className="text-xs text-muted-foreground">Modular Monolith • Production Ready</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight leading-tight">
            {t("dashboard.title")} <span className="text-primary">— {t("common.appName")}</span>
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-xl">
            {t("dashboard.welcome", { name: "" }).replace(/^,\s*/, "")} A single NestJS process, strictly isolated modules, CQRS + neverthrow, shared contracts, and 1-command reskin. Built for ERP, CRM, and B2B scale.
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <Link to="/notes">
              <Button size="sm" className="h-9 gap-2 shadow-sm">
                <Boxes className="h-4 w-4" /> Explore Vertical Slice <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Button>
            </Link>
            <a href="/api/docs" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="h-9 gap-2 bg-background">
                <Layers className="h-4 w-4" /> Scalar API Docs
              </Button>
            </a>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-4 font-mono text-xs leading-relaxed shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="font-semibold tracking-tight text-foreground">System Map</span>
            <span className="ml-auto text-[11px] text-muted-foreground">Turborepo + pnpm</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" /> apps/web <span className="text-muted-foreground">→ React 19 + Vite</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-purple" /> apps/api <span className="text-muted-foreground">→ NestJS 11 + Fastify</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-blue" /> packages/contracts <span className="text-muted-foreground">→ Zod + oRPC</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent-green" /> packages/ui <span className="text-muted-foreground">→ Radix + Tailwind v4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

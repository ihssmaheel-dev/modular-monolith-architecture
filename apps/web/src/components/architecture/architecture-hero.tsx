import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  ExternalLink,
  GitBranch,
  Layers,
  Lock,
  Radio,
  Server,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
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
      label: "Capability Packages",
      value: "7",
      hint: "Contracts, FGA, i18n, Client, Email, UI, TS Config",
    },
    { label: "Bounded Modules", value: "5", hint: "Auth, Users, Tenancy, Notes, Files" },
    { label: "Vitest Unit Tests", value: "79+", hint: "100% Passing suites across all domains" },
    { label: "Boundary Leaks", value: "0", hint: "Enforced by dependency-cruiser rules" },
    {
      label: "End-to-End Type Safety",
      value: "100%",
      hint: "Zod 4 + oRPC Contracts single source",
    },
    { label: "Multi-Tenancy", value: "Zero-Trust", hint: "Single & Multi-Tenant CLS isolation" },
  ];

  return (
    <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="space-y-8 text-center max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge
            variant="outline"
            className="gap-1.5 py-1 px-3 border-primary/30 bg-background/60 backdrop-blur"
          >
            <Sparkles className="size-3 text-primary animate-pulse" />
            <span className="font-semibold text-foreground">
              Production-Ready Architecture v2.0
            </span>
          </Badge>
          <Badge variant="secondary" className="gap-1.5 py-1 px-3 font-mono text-[11px]">
            <Server className="size-3 text-emerald-500" />
            <span>Fastify 5 + NestJS 11 + React 19</span>
          </Badge>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl bg-gradient-to-b from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent">
            Enterprise Modular Monolith Architecture
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-normal">
            A high-throughput, type-safe software architecture combining{" "}
            <strong className="text-foreground font-semibold">CQRS Lite</strong>,{" "}
            <strong className="text-foreground font-semibold">oRPC Contracts</strong>,{" "}
            <strong className="text-foreground font-semibold">
              Fine-Grained Authorization (FGA)
            </strong>
            , <strong className="text-foreground font-semibold">Transactional Outbox</strong>,{" "}
            <strong className="text-foreground font-semibold">Redis 7 Distributed Caching</strong>,
            and <strong className="text-foreground font-semibold">Full Local Observability</strong>{" "}
            into one cohesive developer experience.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button
            size="lg"
            className="gap-2 shadow-md hover:shadow-lg transition-all"
            render={<Link to={signedIn ? "/dashboard" : "/auth"} />}
          >
            <span>{signedIn ? "Open Workspace Cockpit" : "Launch App & Experience Live"}</span>
            <ArrowRight className="size-4" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="gap-2"
            render={<a href="http://localhost:3000/api/docs" target="_blank" rel="noreferrer" />}
          >
            <Code2 className="size-4 text-primary" />
            <span>Interactive Scalar API Docs</span>
            <ExternalLink className="size-3 text-muted-foreground" />
          </Button>

          <Button size="lg" variant="ghost" className="gap-2" render={<a href="#decisions" />}>
            <Cpu className="size-4" />
            <span>Why This Architecture?</span>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 text-start">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="bg-background/70 border-muted/80 backdrop-blur-sm shadow-xs hover:border-primary/40 transition-colors"
            >
              <CardContent className="p-3.5 space-y-1">
                <p className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</p>
                <p className="text-xs font-semibold text-foreground/90">{stat.label}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{stat.hint}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

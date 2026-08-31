import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Boxes,
  Check,
  Database,
  ExternalLink,
  GitBranch,
  Layers3,
  LockKeyhole,
  Radio,
  Server,
  ShieldCheck,
  Workflow,
  Zap,
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { useAuthStore } from "@/stores/auth.store";

export const Route = createFileRoute("/")({ component: HomePage });

const references = [
  ["TanStack Start", "https://tanstack.com/start/latest/docs/framework/react/overview"],
  ["TanStack Router", "https://tanstack.com/router/latest"],
  ["TanStack Query", "https://tanstack.com/query/latest"],
  ["NestJS", "https://docs.nestjs.com"],
  ["Fastify", "https://fastify.dev/docs/latest"],
  ["oRPC", "https://orpc.unnoq.com/"],
  ["OpenAPI", "https://spec.openapis.org/oas/latest.html"],
  ["Scalar", "https://scalar.com/"],
  ["Drizzle", "https://orm.drizzle.team/docs/overview"],
  ["PostgreSQL", "https://www.postgresql.org/docs/"],
  ["Redis", "https://redis.io/docs/latest/"],
  ["AWS S3", "https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html"],
  ["Nodemailer", "https://nodemailer.com/"],
  ["BullMQ", "https://docs.bullmq.io/"],
  ["Zod", "https://zod.dev/"],
  ["React Hook Form", "https://react-hook-form.com/"],
  ["Zustand", "https://zustand.docs.pmnd.rs/"],
  ["Tailwind CSS", "https://tailwindcss.com/docs"],
  ["Base UI", "https://base-ui.com/react"],
  ["Lucide", "https://lucide.dev/guide/"],
  ["i18next", "https://www.i18next.com/"],
  ["pnpm", "https://pnpm.io/"],
  ["Turborepo", "https://turborepo.com/docs"],
  ["OpenTelemetry", "https://opentelemetry.io/docs/"],
  ["Prometheus", "https://prometheus.io/docs/introduction/overview/"],
  ["Grafana", "https://grafana.com/docs/"],
  ["Loki", "https://grafana.com/oss/loki/"],
  ["Vitest", "https://vitest.dev/"],
  ["Docker Compose", "https://docs.docker.com/compose/"],
] as const;

const folderTree = `apps/
├── api/src/
│   ├── common/              cross-cutting guards and pipes
│   ├── infrastructure/     database, Redis, queues, storage, observability
│   └── modules/[domain]/    presentation → application → domain → infrastructure
apps/web/src/
├── routes/                  thin TanStack Start pages and layouts
├── features/                typed queries and mutations
├── components/              shared shell and composed UI
└── stores/                  persisted auth, locale, and tenant context
packages/
├── contracts/               Zod schemas, DTOs, and oRPC contracts
├── api-client/              typed REST client and middleware
├── authorization/           RBAC + ReBAC + ABAC evaluator
├── i18n/                    en / es / fr translations
├── ui/                      Base UI + shadcn design system
└── email/                   React Email templates`;

function HomePage() {
  const { t } = useTranslation();
  const signedIn = Boolean(useAuthStore((state) => state.user));
  const capabilities = [
    [t("architecture.modular"), t("architecture.modularDescription"), Boxes],
    [t("architecture.api"), t("architecture.apiDescription"), Server],
    [t("architecture.contracts"), t("architecture.contractsDescription"), GitBranch],
    [t("architecture.data"), t("architecture.dataDescription"), Database],
    [t("architecture.redis"), t("architecture.redisDescription"), Radio],
    [t("architecture.tenancy"), t("architecture.tenancyDescription"), LockKeyhole],
    [t("architecture.auth"), t("architecture.authDescription"), ShieldCheck],
    [t("architecture.events"), t("architecture.eventsDescription"), Workflow],
    [t("architecture.storage"), t("architecture.storageDescription"), Layers3],
    [t("architecture.observability"), t("architecture.observabilityDescription"), Zap],
    [t("architecture.tooling"), t("architecture.toolingDescription"), Check],
  ] as const;
  const steps = [
    t("architecture.step1"),
    t("architecture.step2"),
    t("architecture.step3"),
    t("architecture.step4"),
    t("architecture.step5"),
    t("architecture.step6"),
    t("architecture.step7"),
    t("architecture.step8"),
  ];
  return (
    <div className="min-h-svh bg-muted/20">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Layers3 className="size-4" />
            </span>
            <span className="font-semibold tracking-tight">{t("common.appName")}</span>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {t("home.platformBadge")}
            </Badge>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<a href="#references" />}>
              {t("home.referencesTitle")}
            </Button>
            <Button size="sm" render={<Link to={signedIn ? "/dashboard" : "/auth"} />}>
              {signedIn ? t("dashboard.title") : t("home.proceed")}
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-20 px-4 py-14 sm:px-6 sm:py-20">
        <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <Badge variant="outline" className="mb-5">
              <Zap className="size-3" />
              {t("auth.heroTagline")}
            </Badge>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
              {t("home.wiredTitle")}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              {t("auth.heroDescription")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" render={<Link to={signedIn ? "/dashboard" : "/auth"} />}>
                {signedIn ? t("dashboard.title") : t("home.proceed")}
                <ArrowRight className="size-4" />
              </Button>
              <Button size="lg" variant="outline" render={<a href="#architecture" />}>
                {t("home.exploreArchitecture")}
              </Button>
            </div>
          </div>
          <Card className="overflow-hidden border-primary/20 bg-background shadow-lg">
            <CardHeader>
              <CardDescription>{t("home.flowTitle")}</CardDescription>
              <CardTitle>{t("home.flowDescription")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {[
                  t("architecture.flowUi"),
                  t("architecture.flowClient"),
                  t("architecture.flowContracts"),
                  t("architecture.flowApplication"),
                  t("architecture.flowRepository"),
                  t("architecture.flowPersistence"),
                ].map((label, index) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {index + 1}
                    </span>
                    <span>{label}</span>
                    {index < 5 && <ArrowRight className="ms-auto size-3 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
        <section id="architecture" className="scroll-mt-24 space-y-6">
          <div>
            <p className="text-sm font-medium text-primary">{t("home.platformBadge")}</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">{t("home.wiredTitle")}</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">{t("home.wiredDescription")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(([title, description, Icon]) => (
              <Card key={title} className="transition-colors hover:border-primary/40">
                <CardHeader>
                  <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{title}</CardTitle>
                    <Badge variant="secondary" className="text-[10px]">
                      {t("home.wiredBadge")}
                    </Badge>
                  </div>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
        <section className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <Card>
            <CardHeader>
              <CardTitle>{t("home.patternTitle")}</CardTitle>
              <CardDescription>{t("home.patternDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{t("home.patternModular")}</p>
              <p>{t("home.patternLayers")}</p>
              <p>{t("home.patternRuntime")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("home.folderTitle")}</CardTitle>
              <CardDescription>{t("home.folderDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-xl border bg-muted/40 p-4 font-mono text-xs leading-6 text-muted-foreground">
                {folderTree}
              </pre>
            </CardContent>
          </Card>
        </section>
        <section className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <Card>
            <CardHeader>
              <CardTitle>{t("home.startTitle")}</CardTitle>
              <CardDescription>{t("home.startDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {steps.map((step) => (
                  <li key={step} className="flex gap-3 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("architecture.modular")}</CardTitle>
              <CardDescription>{t("home.flowDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border bg-muted/30 p-4">
                <GitBranch className="mb-3 size-5 text-primary" />
                <p className="font-medium">{t("architecture.contracts")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("common.contractDriven")}</p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <ShieldCheck className="mb-3 size-5 text-primary" />
                <p className="font-medium">{t("architecture.tenancy")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("architecture.auth")}</p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <Radio className="mb-3 size-5 text-primary" />
                <p className="font-medium">{t("architecture.events")}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("architecture.observability")}
                </p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <LockKeyhole className="mb-3 size-5 text-primary" />
                <p className="font-medium">{t("architecture.security")}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t("architecture.tooling")}</p>
              </div>
            </CardContent>
          </Card>
        </section>
        <section id="references" className="scroll-mt-24 space-y-6">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">{t("home.referencesTitle")}</h2>
            <p className="mt-2 text-muted-foreground">{t("home.referencesDescription")}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {references.map(([name, href]) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-between rounded-lg border bg-background px-4 py-3 text-sm transition-colors hover:border-primary/50 hover:bg-muted/40"
              >
                <span>{name}</span>
                <ExternalLink className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

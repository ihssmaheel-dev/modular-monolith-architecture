import { Folder, FileCode, CheckCircle2, ShieldCheck, Cpu, Database } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

export function ArchitectureFolderTree() {
  const tree = `monorepo/
├── apps/
│   ├── api/                           ← NestJS 11 + Fastify 5 Modular Monolith API
│   │   ├── src/
│   │   │   ├── common/                ← Cross-cutting guards, pipes, filters, and interceptors
│   │   │   ├── config/                ← Single validated environment loader (env.ts)
│   │   │   ├── infrastructure/        ← Database, Redis, Queues, Workers, S3, Email, Tracing
│   │   │   └── modules/[domain]/      ← Bounded domain module (Auth, Users, Tenancy, Notes, Files)
│   │   │       ├── presentation/      ← Thin Fastify controllers & error mappers
│   │   │       ├── application/       ← CQRS Lite commands, queries, policies, and listeners
│   │   │       ├── domain/            ← Pure entities, value objects, domain events, errors
│   │   │       └── infrastructure/    ← Drizzle ORM schemas & tenant-scoped repositories
│   │   └── test/                      ← Vitest E2E test suites & mock fixtures
│   └── web/                           ← React 19 + TanStack Start Full-Stack Web Application
│       └── src/
│           ├── routes/                ← File-based type-safe TanStack routes
│           ├── components/            ← Composed UI, shell, theme provider, and architecture views
│           ├── features/              ← Domain query & mutation hooks (React Query)
│           ├── stores/                ← Zustand client stores (Auth, Locale, Tenant)
│           └── lib/                   ← Typed API client instance & i18n initialization
├── packages/
│   ├── contracts/                     ← Zod 4 schemas, DTO interfaces, error codes, oRPC contracts
│   ├── authorization/                 ← Pure FGA engine (RBAC + ReBAC + ABAC) & action vocabulary
│   ├── i18n/                          ← EN, ES, FR locale dictionaries & key resolvers
│   ├── api-client/                    ← Type-safe oRPC client SDK with auto token/tenant refresh
│   ├── email/                         ← React Email transactional templates & token styling
│   ├── ui/                            ← Accessible Base UI components styled with Tailwind CSS v4
│   └── typescript-config/             ← Shared strict TypeScript configuration bases
├── docker/                            ← Complete Docker Compose infrastructure & Grafana dashboards
├── migrations/                        ← PostgreSQL Drizzle Kit migrations & snapshots
├── scripts/                           ← Bootstrap, generators, and dependency-cruiser rule checkers
└── ai_instructions/                   ← Architecture rules & coding standards for AI & developers`;

  return (
    <section id="structure" className="scroll-mt-24 space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          Clean Codebase Organization
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Monorepo Structure & File Placement Rules
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          Every file lands in a predetermined, deterministic location on first creation. Moving
          files later is waste.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="overflow-hidden border-primary/20 bg-muted/40 font-mono text-xs shadow-sm">
          <CardHeader className="py-3 px-4 border-b bg-background/50 flex flex-row items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Folder className="size-3.5 text-primary" />
              Repository Root Tree
            </span>
            <Badge variant="outline" className="text-[10px]">
              Turborepo + pnpm
            </Badge>
          </CardHeader>
          <CardContent className="p-4 overflow-x-auto">
            <pre className="text-xs leading-relaxed text-foreground/90 font-mono">
              <code>{tree}</code>
            </pre>
          </CardContent>
        </Card>

        <div className="space-y-4 flex flex-col justify-between">
          <Card className="border-muted/80 bg-background/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-500" />
                Zero-Bleed Layer Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-2">
              <p>
                1. <strong>Domain</strong> has 0 dependencies on any framework, ORM, or NestJS
                package.
              </p>
              <p>
                2. <strong>Application</strong> depends ONLY on Domain and persistence interfaces.
              </p>
              <p>
                3. <strong>Presentation</strong> delegates all business logic to Commands/Queries.
              </p>
              <p>
                4. <strong>Infrastructure</strong> implements repository interfaces using Drizzle
                ORM.
              </p>
            </CardContent>
          </Card>

          <Card className="border-muted/80 bg-background/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Cpu className="size-4 text-purple-500" />
                Capability Package Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-2">
              <p>
                • <strong>@repo/contracts</strong> is the single source of truth for all data
                shapes.
              </p>
              <p>
                • <strong>@repo/authorization</strong> provides pure functional security policies.
              </p>
              <p>
                • <strong>@repo/api-client</strong> is the unified SDK consumed by all clients.
              </p>
              <p>
                • <strong>@repo/ui</strong> is the shared Base UI design system for frontend apps.
              </p>
            </CardContent>
          </Card>

          <Card className="border-muted/80 bg-background/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Database className="size-4 text-cyan-500" />
                Automated Rule Enforcement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
              Every pull request and build runs{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">
                pnpm rules:check
              </code>{" "}
              via dependency-cruiser to mathematically guarantee no forbidden cross-module imports
              or layer boundary leaks exist.
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

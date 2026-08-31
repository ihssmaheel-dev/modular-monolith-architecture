import { ExternalLink, Layers, Sparkles } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

export function ArchitectureTechStack() {
  const categories = [
    {
      category: "Backend & API Runtime",
      items: [
        {
          name: "NestJS 11",
          desc: "Modular architecture & dependency injection framework",
          url: "https://docs.nestjs.com",
        },
        {
          name: "Fastify 5",
          desc: "Ultra-low overhead HTTP engine (2x faster than Express)",
          url: "https://fastify.dev",
        },
        {
          name: "oRPC",
          desc: "Contract-first type-safe RPC & OpenAPI generation",
          url: "https://orpc.unnoq.com",
        },
        {
          name: "Scalar",
          desc: "Modern interactive OpenAPI 3.1 reference docs",
          url: "https://scalar.com",
        },
        {
          name: "neverthrow",
          desc: "Type-safe functional Result<T, E> error handling",
          url: "https://github.com/supermacro/neverthrow",
        },
      ],
    },
    {
      category: "Data, Cache & Messaging",
      items: [
        {
          name: "PostgreSQL 16",
          desc: "Primary relational database with ACID transactions",
          url: "https://www.postgresql.org",
        },
        {
          name: "Drizzle ORM",
          desc: "Zero-overhead type-safe SQL query builder and migrations",
          url: "https://orm.drizzle.team",
        },
        {
          name: "Redis 7 & ioredis",
          desc: "Distributed caching, rate limiting, and pub/sub streams",
          url: "https://redis.io",
        },
        {
          name: "BullMQ 5",
          desc: "Distributed asynchronous background job queues",
          url: "https://docs.bullmq.io",
        },
        {
          name: "Piscina 5",
          desc: "Worker thread pool for CPU-bound computation tasks",
          url: "https://github.com/piscinajs/piscina",
        },
      ],
    },
    {
      category: "Security, Storage & Email",
      items: [
        {
          name: "FGA Engine",
          desc: "Pure functional RBAC + ReBAC + ABAC evaluator",
          url: "#layers",
        },
        {
          name: "MinIO & AWS S3",
          desc: "Object storage with presigned upload URLs",
          url: "https://min.io",
        },
        {
          name: "React Email",
          desc: "Component-based responsive transactional email templates",
          url: "https://react.email",
        },
        {
          name: "Zod 4",
          desc: "Declarative schema validation and DTO inference",
          url: "https://zod.dev",
        },
        {
          name: "Mailpit",
          desc: "Local SMTP email capture and preview server",
          url: "https://mailpit.axllent.org",
        },
      ],
    },
    {
      category: "Frontend, UI & State",
      items: [
        {
          name: "React 19",
          desc: "Modern UI library with Server Components & Actions",
          url: "https://react.dev",
        },
        {
          name: "TanStack Start",
          desc: "Full-stack framework with SSR, streaming & server functions",
          url: "https://tanstack.com/start",
        },
        {
          name: "TanStack Router",
          desc: "100% type-safe file-based client and server routing",
          url: "https://tanstack.com/router",
        },
        {
          name: "TanStack Query v5",
          desc: "Async state management and cache synchronization",
          url: "https://tanstack.com/query",
        },
        {
          name: "Base UI & Tailwind 4",
          desc: "Accessible headless components with CSS tokens",
          url: "https://base-ui.com",
        },
        {
          name: "Zustand",
          desc: "Minimalist client state stores with persistence",
          url: "https://zustand.docs.pmnd.rs",
        },
      ],
    },
    {
      category: "Observability & Tooling",
      items: [
        {
          name: "OpenTelemetry",
          desc: "Vendor-neutral distributed tracing and metrics SDK",
          url: "https://opentelemetry.io",
        },
        {
          name: "Prometheus",
          desc: "Time-series metrics collection and monitoring engine",
          url: "https://prometheus.io",
        },
        {
          name: "Grafana 11",
          desc: "Rich interactive telemetry dashboards and alerts",
          url: "https://grafana.com",
        },
        {
          name: "Loki & Promtail",
          desc: "High-performance structured log aggregation",
          url: "https://grafana.com/oss/loki",
        },
        {
          name: "Turborepo & pnpm",
          desc: "Blazing-fast monorepo task pipeline and caching",
          url: "https://turborepo.com",
        },
        {
          name: "Vitest",
          desc: "Next-generation unit and integration test runner",
          url: "https://vitest.dev",
        },
      ],
    },
  ];

  return (
    <section id="stack" className="scroll-mt-24 space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          Curated Technology Stack
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          30+ Best-in-Class Technologies Perfectly Wired
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          Every tool is locked and pre-configured. Click any technology to open official
          documentation.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card
            key={cat.category}
            className="border-muted/80 bg-background/60 backdrop-blur-xs flex flex-col justify-between shadow-xs"
          >
            <CardHeader className="p-4 pb-2 border-b bg-muted/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                {cat.category}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <div className="divide-y divide-muted/60">
                {cat.items.map((tech) => (
                  <a
                    key={tech.name}
                    href={tech.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start justify-between py-2 hover:bg-muted/40 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="space-y-0.5 pe-2">
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <span>{tech.name}</span>
                        <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-tight">{tech.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

import {
  Terminal,
  Play,
  Sparkles,
  CheckCircle2,
  GitBranch,
  Database,
  Cpu,
  Shield,
  Layers,
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

export function ArchitectureDevExperience() {
  const commands = [
    {
      cmd: "pnpm bootstrap",
      title: "1-Command Environment Setup",
      description:
        "Generates cryptographic JWT keys, spins up Docker containers, initializes S3 buckets, runs PostgreSQL migrations, and builds all packages in one go.",
      badge: "Initialization",
    },
    {
      cmd: "pnpm generate:feature <module> <feature>",
      title: "6-Layer Feature Scaffolding",
      description:
        "Automatically generates Zod schemas, oRPC contracts, CQRS Commands/Queries, pure Domain entities, Drizzle repositories, controllers, and unit test suites.",
      badge: "Code Generator",
    },
    {
      cmd: "pnpm rules:check",
      title: "Automated Architecture Gatekeeper",
      description:
        "Uses dependency-cruiser to verify that presentation, application, domain, and infrastructure layer boundaries have zero illegal dependencies.",
      badge: "Architecture Linter",
    },
    {
      cmd: "pnpm dev:api & pnpm dev:web",
      title: "Lightning-Fast Local Development",
      description:
        "Fastify API with NestJS SWC hot reload on port 3000 alongside TanStack Start SSR web runtime on port 3002 with zero-friction DX.",
      badge: "Dev Server",
    },
    {
      cmd: "pnpm test:unit",
      title: "Instant Unit Test Execution",
      description:
        "79+ Vitest test suites executing in milliseconds against isolated domain entities, CQRS commands, and FGA policies with 100% mock isolation.",
      badge: "Testing",
    },
    {
      cmd: "pnpm db:generate & pnpm db:migrate",
      title: "Safe PostgreSQL Schema Migrations",
      description:
        "Drizzle Kit analyzes TypeScript schema definitions and generates deterministic, audited SQL migration files in migrations/pg/.",
      badge: "Database",
    },
  ];

  return (
    <section id="tooling" className="scroll-mt-24 space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          Superior Developer Experience
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Built for Extreme Engineering Velocity
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          From 1-click bootstrap to automated 6-layer feature generators, every workflow is
          engineered to eliminate boilerplate and keep engineers in the flow state.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {commands.map((item) => (
          <Card
            key={item.cmd}
            className="border-muted/80 bg-background/60 backdrop-blur-xs flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs"
          >
            <CardHeader className="p-4 space-y-2 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {item.badge}
                </Badge>
                <Terminal className="size-4 text-primary" />
              </div>
              <CardTitle className="text-base font-bold">{item.title}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2 mt-auto">
              <div className="rounded-md border bg-muted/40 p-2.5 font-mono text-xs text-foreground font-semibold flex items-center gap-2">
                <span className="text-primary select-none">$</span>
                <span className="truncate">{item.cmd}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

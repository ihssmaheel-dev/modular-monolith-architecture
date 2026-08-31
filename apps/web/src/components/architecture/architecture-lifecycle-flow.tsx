import {
  ArrowRight,
  CheckCircle2,
  Database,
  Globe,
  Layers,
  Lock,
  Radio,
  Server,
  ShieldCheck,
  Workflow,
  Zap,
} from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

export function ArchitectureLifecycleFlow() {
  const steps = [
    {
      step: 1,
      title: "Client & UI Invocation",
      actor: "TanStack Start + @repo/api-client",
      description:
        "Frontend executes a mutation using React Query with automatic Bearer JWT, x-tenant-id, idempotency-key, and Accept-Language headers.",
      icon: Globe,
      color: "text-blue-500",
    },
    {
      step: 2,
      title: "Fastify Gateway & Global Security",
      actor: "Fastify 5 + NestJS Guards",
      description:
        "Request enters Fastify HTTP gateway. WAF middleware filters payload, AuthGuard verifies JWT, and TenantContextGuard binds AsyncLocalStorage (CLS).",
      icon: ShieldCheck,
      color: "text-emerald-500",
    },
    {
      step: 3,
      title: "Fine-Grained Authorization (FGA)",
      actor: "@repo/authorization Evaluator",
      description:
        "PermissionsGuard evaluates action permissions (e.g. notes:create), checks role hierarchy, and tests dynamic resource ownership predicates (ReBAC).",
      icon: Lock,
      color: "text-amber-500",
    },
    {
      step: 4,
      title: "Schema Validation Pipe",
      actor: "Zod 4 & @repo/contracts",
      description:
        "ZodValidationPipe validates request body, query, and params against the single-source-of-truth Zod schema, rejecting malformed inputs before controller.",
      icon: CheckCircle2,
      color: "text-purple-500",
    },
    {
      step: 5,
      title: "CQRS Lite Application Command",
      actor: "CreateNoteCommand (Application Layer)",
      description:
        "Controller delegates execution to the single-purpose Command handler. Returns functional neverthrow Result<T, E> for predictable error handling.",
      icon: Workflow,
      color: "text-cyan-500",
    },
    {
      step: 6,
      title: "Pure Domain Entity Validation",
      actor: "Note.create(...) (Domain Layer)",
      description:
        "Pure domain model validates business invariants (title constraints, slug formatting, initial state) with 0 framework dependencies.",
      icon: Layers,
      color: "text-indigo-500",
    },
    {
      step: 7,
      title: "Tenant-Scoped PostgreSQL Transaction",
      actor: "TenantScopedRepository + Drizzle ORM",
      description:
        "Executes typed SQL in a database transaction, automatically injecting 'tenant_id' to prevent data bleeding across organizations.",
      icon: Database,
      color: "text-rose-500",
    },
    {
      step: 8,
      title: "Atomic Transactional Outbox",
      actor: "OutboxService (PostgreSQL)",
      description:
        "Writes outgoing domain event (NoteCreatedEvent) into the 'outbox' table in the exact same database transaction as the entity mutation.",
      icon: Zap,
      color: "text-amber-400",
    },
    {
      step: 9,
      title: "Asynchronous Relay & Realtime",
      actor: "OutboxRelayWorker + Redis Streams",
      description:
        "Relay worker polls outbox with 'FOR UPDATE SKIP LOCKED' and dispatches to BullMQ, React Email templates, and WebSocket/SSE channels.",
      icon: Radio,
      color: "text-sky-500",
    },
    {
      step: 10,
      title: "Telemetry & Observability",
      actor: "OpenTelemetry + Prometheus + Pino",
      description:
        "Request duration recorded in Prometheus histograms, distributed trace spans sent to Jaeger (:16686), and structured logs aggregated into Loki.",
      icon: Server,
      color: "text-emerald-400",
    },
  ];

  return (
    <section id="lifecycle" className="scroll-mt-24 space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          End-to-End Request Journey
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          The 10-Stage Request & Mutation Lifecycle
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          Follow a request from the user interface down through guards, CQRS handlers, domain
          invariants, database transactions, outbox relays, and observability sinks.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.step}
              className="relative flex flex-col border-muted/80 bg-background/60 backdrop-blur-xs hover:border-primary/50 transition-all shadow-xs"
            >
              <CardHeader className="p-4 space-y-2 pb-2">
                <div className="flex items-center justify-between">
                  <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold font-mono">
                    {item.step}
                  </span>
                  <Icon className={`size-4 ${item.color}`} />
                </div>
                <CardTitle className="text-sm font-bold leading-tight">{item.title}</CardTitle>
                <Badge variant="secondary" className="text-[9px] font-mono w-fit py-0">
                  {item.actor}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 pt-0 text-[11px] text-muted-foreground leading-relaxed">
                {item.description}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui";

const rows = [
  { label: "Backend", value: "NestJS 11 + Fastify 5", sub: "Modular monolith, not microservices" },
  { label: "Database", value: "Postgres 16 + Drizzle 0.45", sub: "RLS + pg.Pool slow >100ms log" },
  { label: "Cache / Queue", value: "Redis 7 + BullMQ + Piscina 5", sub: "Idempotency 24h, outbox relay" },
  { label: "Auth & FGA", value: "JWT + argon2 + RBAC/ReBAC/ABAC", sub: "evaluateAuthorization 7-step" },
  { label: "Contracts", value: "Zod 4 + oRPC", sub: "Single @repo/contracts, OpenAPI Scalar" },
  { label: "Frontend", value: "React 19 + Vite + TanStack Router/Query", sub: "Offline 24h + optimistic" },
  { label: "UI", value: "Radix + Tailwind v4 + B12", sub: "1-command reskin via preset" },
];

export function TechStack() {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Locked Stack</CardTitle>
        <p className="text-xs text-muted-foreground">No paid deps. Enforced by CORE_RULES + dep-cruiser.</p>
      </CardHeader>
      <CardContent className="space-y-0 divide-y divide-border text-xs">
        {rows.map((r) => (
          <div key={r.label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3">
            <span className="text-muted-foreground font-medium">{r.label}</span>
            <div className="text-left sm:text-right">
              <p className="font-mono font-medium">{r.value}</p>
              <p className="text-[11px] text-muted-foreground">{r.sub}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

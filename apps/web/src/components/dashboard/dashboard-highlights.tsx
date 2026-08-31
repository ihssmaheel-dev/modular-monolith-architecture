import { Zap, ShieldCheck, Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

export function DashboardHighlights() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="border-muted/80 bg-background/60">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Zap className="size-4 text-amber-500" />
            CQRS Lite Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-1.5">
          <p>• Single-responsibility Command & Query classes strictly under 150 lines.</p>
          <p>
            • Returns functional{" "}
            <strong className="text-foreground font-mono">neverthrow Result&lt;T, E&gt;</strong> for
            100% deterministic unit testing.
          </p>
        </CardContent>
      </Card>

      <Card className="border-muted/80 bg-background/60">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500" />
            FGA Access Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-1.5">
          <p>
            • Evaluates wildcard action vocabularies (e.g.{" "}
            <span className="font-mono text-foreground">notes:*</span>).
          </p>
          <p>• ReBAC dynamically checks resource ownership predicates on every write.</p>
        </CardContent>
      </Card>

      <Card className="border-muted/80 bg-background/60">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Radio className="size-4 text-sky-500" />
            Transactional Outbox
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 text-xs text-muted-foreground space-y-1.5">
          <p>• Mutations and outbox events commit in the same PostgreSQL transaction.</p>
          <p>• Relayed asynchronously to Redis Streams & BullMQ with 0 dual-write risk.</p>
        </CardContent>
      </Card>
    </div>
  );
}

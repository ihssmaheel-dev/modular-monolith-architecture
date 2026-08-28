import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui";
import { Monitor, Brain, Hexagon, HardDrive, ArrowDown } from "lucide-react";

const layers = [
  { icon: Monitor, title: "Presentation", desc: "Controllers • Thin • Zod + handleResult", color: "bg-accent-blue" },
  { icon: Brain, title: "Application", desc: "Commands/Queries • Result • Outbox", color: "bg-accent-purple" },
  { icon: Hexagon, title: "Domain", desc: "Entities • Pure TS • No framework", color: "bg-primary" },
  { icon: HardDrive, title: "Infrastructure", desc: "Drizzle • Redis • S3 • BullMQ", color: "bg-accent-green" },
];

export function LayerDiagram() {
  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Clean Architecture — Dependency Rule</CardTitle>
        <p className="text-xs text-muted-foreground">Inner layers know nothing about outer. Dependency points inward only.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {layers.map((l, i) => (
          <div key={l.title}>
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3.5">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${l.color} text-white shadow-sm`}>
                <l.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tracking-tight">{i + 1}. {l.title}</p>
                <p className="text-xs text-muted-foreground">{l.desc}</p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground hidden sm:block">{i === 0 ? "HTTP" : i === 1 ? "CQRS" : i === 2 ? "Pure" : "Dirty"}</span>
            </div>
            {i < layers.length - 1 && (
              <div className="flex justify-center py-1.5">
                <ArrowDown className="h-3.5 w-3.5 text-muted-foreground/60" />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

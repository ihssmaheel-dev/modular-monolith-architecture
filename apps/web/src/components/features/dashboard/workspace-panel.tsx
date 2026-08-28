import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from "@repo/ui";
import { Building2, Database, Shield, Layers, Activity, ArrowRight } from "lucide-react";

export function WorkspacePanel() {
  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary text-primary-foreground shadow-md overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-semibold">Ready to extend?</h3>
            <p className="text-xs leading-relaxed text-primary-foreground/80">Scaffold a full vertical slice in seconds.</p>
          </div>
          <div className="rounded-lg bg-white/10 px-3 py-2.5 font-mono text-xs border border-white/10">pnpm generate:feature &lt;module&gt; &lt;feature&gt;</div>
          <Link to="/notes">
            <Button variant="secondary" size="sm" className="w-full gap-2 bg-white text-primary hover:bg-white/90">
              Open Example <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" /> System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0 text-xs divide-y divide-border">
          <div className="flex justify-between py-2.5">
            <span className="text-muted-foreground">API</span>
            <span className="font-mono font-medium">NestJS 11 + Fastify</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-muted-foreground">DB</span>
            <span className="font-mono font-medium">Postgres 16 • Drizzle</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-muted-foreground">Realtime</span>
            <span className="font-mono font-medium">Redis + BullMQ</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-muted-foreground">UI</span>
            <span className="font-mono font-medium">Radix • Tailwind v4</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Capabilities
          </CardTitle>
          <CardDescription className="text-xs">What this starter gives you</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {[
            { title: "RBAC + FGA", desc: "ReBAC / ABAC", icon: Shield, color: "bg-accent-purple" },
            { title: "CQRS", desc: "Commands & Queries", icon: Layers, color: "bg-accent-blue" },
            { title: "Observability", desc: "Traces + Metrics", icon: Activity, color: "bg-accent-green" },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-border/60 p-4 space-y-2 hover:bg-muted/20 transition-colors">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${f.color} text-white shadow-sm`}>
                <f.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

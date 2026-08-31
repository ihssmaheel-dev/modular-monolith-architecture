import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  Code2,
  Activity,
  Zap,
  Server,
  Building2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

export function DashboardToolingDock() {
  const tools = [
    {
      label: "Scalar API Docs",
      url: "http://localhost:3000/api/docs",
      icon: Code2,
      color: "text-primary",
    },
    {
      label: "Grafana (3001)",
      url: "http://localhost:3001",
      icon: Activity,
      color: "text-amber-500",
    },
    { label: "Jaeger (16686)", url: "http://localhost:16686", icon: Zap, color: "text-sky-500" },
    {
      label: "Mailpit (8025)",
      url: "http://localhost:8025",
      icon: Server,
      color: "text-purple-500",
    },
    {
      label: "MinIO (9001)",
      url: "http://localhost:9001",
      icon: Building2,
      color: "text-cyan-500",
    },
  ];

  return (
    <Card className="border-primary/20 bg-muted/30">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
          <Sparkles className="size-3.5" />
          Developer Observability & Tooling Dock
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-1 flex flex-wrap items-center gap-2">
        {tools.map((t) => (
          <Button
            key={t.label}
            variant="outline"
            size="sm"
            className="text-xs h-8 gap-1.5 bg-background"
            render={<a href={t.url} target="_blank" rel="noreferrer" />}
          >
            <t.icon className={`size-3.5 ${t.color}`} />
            <span>{t.label}</span>
            <ExternalLink className="size-3 text-muted-foreground" />
          </Button>
        ))}

        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-8 gap-1.5 ms-auto"
          render={<Link to="/" />}
        >
          <span>Architecture Deep Dive</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

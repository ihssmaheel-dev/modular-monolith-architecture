import { useTranslation } from "react-i18next";
import { Badge } from "@repo/ui/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { ExternalLink } from "lucide-react";

export function ArchitectureTechStack() {
  const { t } = useTranslation();
  const categories = [
    {
      title: "Backend Core",
      items: ["NestJS 11", "Fastify 5", "Drizzle ORM", "oRPC", "Zod 4", "neverthrow"],
    },
    {
      title: "Frontend Engine",
      items: [
        "React 19",
        "TanStack Start",
        "TanStack Query v5",
        "Tailwind CSS v4",
        "Base UI",
        "Zustand",
      ],
    },
    {
      title: "Data & Storage",
      items: ["PostgreSQL 16", "Redis 7", "MinIO / AWS S3", "BullMQ 5", "Piscina 5"],
    },
    {
      title: "Observability",
      items: [
        "OpenTelemetry",
        "Prometheus 2.50",
        "Grafana 11",
        "Jaeger UI",
        "Grafana Loki",
        "Pino Logger",
      ],
    },
  ];

  return (
    <section className="w-full space-y-8">
      <div className="space-y-2">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider text-primary"
        >
          {t("architecture.techStack.tag")}
        </Badge>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          {t("architecture.techStack.title")}
        </h2>
        <p className="text-muted-foreground max-w-3xl text-base">
          {t("architecture.techStack.subtitle")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => (
          <Card key={cat.title} className="border-muted/80 bg-background/60 shadow-xs">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm font-bold text-foreground flex items-center justify-between">
                <span>{cat.title}</span>
                <ExternalLink className="size-3 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 flex flex-wrap gap-1.5">
              {cat.items.map((item) => (
                <Badge key={item} variant="secondary" className="font-mono text-[11px]">
                  {item}
                </Badge>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

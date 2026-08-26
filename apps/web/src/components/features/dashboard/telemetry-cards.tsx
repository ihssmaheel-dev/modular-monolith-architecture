import { useTranslation } from "react-i18next";
import { Card } from "@repo/ui";
import { Users, Database, Sparkles, Activity } from "lucide-react";

interface TelemetryCardsProps {
  userCount: number;
  usersLoading: boolean;
  tenancyMode?: string;
}

export function DashboardTelemetryCards({
  userCount,
  usersLoading,
  tenancyMode,
}: TelemetryCardsProps) {
  const { t } = useTranslation();

  return (
    <section className="space-y-4">
      <span className="eyebrow">System Telemetry & Metrics</span>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="featured" className="p-6 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">{t("dashboard.stats.users")}</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-foreground">
            {usersLoading ? "..." : userCount}
          </div>
          <p className="text-[11px] text-muted-foreground">Active database accounts</p>
        </Card>

        <Card variant="featured" className="p-6 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Tenancy Engine</span>
            <Database className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-foreground capitalize">
            {tenancyMode ?? "Single"}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {tenancyMode === "multi" ? "Cloud Multi-Tenant SaaS" : "On-Premise / Dedicated"}
          </p>
        </Card>

        <Card variant="featured" className="p-6 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Cache & Persistence</span>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-foreground">24h TTL</div>
          <p className="text-[11px] text-muted-foreground">Offline query storage active</p>
        </Card>

        <Card variant="featured" className="p-6 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Telemetry Stack</span>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="text-3xl font-semibold tracking-tight text-foreground">Port 3001</div>
          <p className="text-[11px] text-muted-foreground">Grafana + Prometheus live</p>
        </Card>
      </div>
    </section>
  );
}

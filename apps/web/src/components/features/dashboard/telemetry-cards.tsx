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
        <Card variant="featured" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide uppercase text-muted-foreground">{t("dashboard.stats.users")}</span>
            <div className="flex size-7 items-center justify-center rounded-sm bg-primary/10">
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-foreground">
              {usersLoading ? "—" : userCount}
            </div>
            <p className="text-xs text-muted-foreground">Active database accounts</p>
          </div>
        </Card>

        <Card variant="featured" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Tenancy Engine</span>
            <div className="flex size-7 items-center justify-center rounded-sm bg-primary/10">
              <Database className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-foreground capitalize">
              {tenancyMode ?? "Single"}
            </div>
            <p className="text-xs text-muted-foreground">
              {tenancyMode === "multi" ? "Cloud multi-tenant SaaS" : "On-premise / dedicated"}
            </p>
          </div>
        </Card>

        <Card variant="featured" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Cache & Persistence</span>
            <div className="flex size-7 items-center justify-center rounded-sm bg-primary/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-foreground">24h TTL</div>
            <p className="text-xs text-muted-foreground">Offline query storage active</p>
          </div>
        </Card>

        <Card variant="featured" className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Telemetry Stack</span>
            <div className="flex size-7 items-center justify-center rounded-sm bg-primary/10">
              <Activity className="h-3.5 w-3.5 text-primary" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-semibold tracking-tight text-foreground">Port 3001</div>
            <p className="text-xs text-muted-foreground">Grafana + Prometheus live</p>
          </div>
        </Card>
      </div>
    </section>
  );
}

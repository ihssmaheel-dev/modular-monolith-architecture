import { Card, CardContent, CardHeader, CardTitle, Badge } from "@repo/ui";
import { Users, FileText, Building2, Activity, TrendingUp, CheckCircle2 } from "lucide-react";

interface DashboardStatsProps {
  userTotal?: number;
  usersLoading: boolean;
  notesTotal?: number;
  notesCount: number;
  tenancyMode?: string;
}

export function DashboardStats({ userTotal, usersLoading, notesTotal, notesCount, tenancyMode }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/60 shadow-sm hover:shadow-md hover:border-border transition-all">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Total Users</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Users className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="text-2xl font-semibold tracking-tight">{usersLoading ? "—" : (userTotal ?? 0).toLocaleString()}</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600 font-medium">
              <TrendingUp className="h-3 w-3" /> +12%
            </span>
            vs last month
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md hover:border-border transition-all">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Notes</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-purple text-white shadow-sm">
            <FileText className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="text-2xl font-semibold tracking-tight">{notesTotal ?? "—"}</div>
          <p className="text-xs text-muted-foreground">{notesCount} recent • tenant-scoped</p>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md hover:border-border transition-all">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-medium tracking-wide uppercase text-muted-foreground">Organization</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-blue text-white shadow-sm">
            <Building2 className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="text-lg font-semibold tracking-tight capitalize flex items-center gap-2">
            {tenancyMode ?? "single"} <Badge variant="outline" className="text-[10px]">Active</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{tenancyMode === "multi" ? "Multi-tenant SaaS" : "Dedicated instance"}</p>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm hover:shadow-md hover:border-border transition-all">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs font-medium tracking-wide uppercase text-muted-foreground">System Health</CardTitle>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
            <Activity className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="flex items-center gap-2 text-lg font-semibold tracking-tight text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Operational
          </div>
          <p className="text-xs text-muted-foreground">All services nominal</p>
        </CardContent>
      </Card>
    </div>
  );
}

import { Server, Building2, ShieldCheck, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";

export interface DashboardStatsProps {
  apiStatus: string;
  tenancyMode: string;
  userRole: string;
  notesTotal: string;
}

export function DashboardStatsGrid({
  apiStatus,
  tenancyMode,
  userRole,
  notesTotal,
}: DashboardStatsProps) {
  const stats = [
    {
      label: "API Gateway",
      value: apiStatus,
      hint: "Fastify 5 + NestJS 11",
      icon: Server,
      color: "text-emerald-500",
    },
    {
      label: "Tenancy Mode",
      value: tenancyMode,
      hint: "Zero-Trust CLS Isolation",
      icon: Building2,
      color: "text-blue-500",
    },
    {
      label: "Active Role & FGA",
      value: userRole,
      hint: "RBAC + ReBAC Evaluator",
      icon: ShieldCheck,
      color: "text-amber-500",
    },
    {
      label: "Domain Notes",
      value: notesTotal,
      hint: "Vertical Slice Persistence",
      icon: FileText,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-muted/80 bg-background/60 shadow-xs hover:border-primary/40 transition-colors"
        >
          <CardHeader className="p-4 pb-2 space-y-1">
            <CardDescription className="flex items-center justify-between text-xs font-medium">
              <span>{stat.label}</span>
              <stat.icon className={`size-4 ${stat.color}`} />
            </CardDescription>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              {stat.value}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-[11px] text-muted-foreground font-mono">{stat.hint}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

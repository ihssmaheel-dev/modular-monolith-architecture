import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { HeroArchitecture } from "@/components/architecture/hero-architecture";
import { ModuleGrid } from "@/components/architecture/module-grid";
import { LayerDiagram } from "@/components/architecture/layer-diagram";
import { RequestFlow } from "@/components/architecture/request-flow";
import { TechStack } from "@/components/architecture/tech-stack";
import { DashboardStats } from "@/components/features/dashboard/dashboard-stats";
import { RecentNotesPanel } from "@/components/features/dashboard/recent-notes-panel";
import { Separator } from "@repo/ui";

function DashboardPage() {
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users", { page: 1, limit: 10 }],
    queryFn: async () => {
      const r = await api.users.list({ query: { page: 1, limit: 10 } });
      if (r.status !== 200) throw new Error("USERS_FETCH_FAILED");
      return r.body;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: notesData } = useQuery({
    queryKey: ["notes", { page: 1, limit: 5 }],
    queryFn: async () => {
      const r = await api.notes.getNotes({ query: { page: 1, limit: 5 } });
      return r.status === 200 ? r.body : null;
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: tenancy } = useQuery({
    queryKey: ["tenancy-status"],
    queryFn: async () => (await api.tenancy.status()).body,
    staleTime: Infinity,
  });

  return (
    <div className="space-y-8 pb-10">
      <HeroArchitecture />

      <DashboardStats
        userTotal={usersData?.total}
        usersLoading={usersLoading}
        notesTotal={notesData?.total}
        notesCount={notesData?.items?.length ?? 0}
        tenancyMode={tenancy?.mode}
      />

      <ModuleGrid />

      <div className="grid gap-6 lg:grid-cols-2">
        <LayerDiagram />
        <div className="space-y-6">
          <RequestFlow />
          <TechStack />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentNotesPanel items={notesData?.items} />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-3">
          <h3 className="font-semibold tracking-tight">Start building now</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">Generate a full-stack vertical slice — contracts, CQRS, Drizzle, UI, tests — all wired and tenant-scoped.</p>
          <div className="rounded-lg bg-muted px-3 py-2.5 font-mono text-xs border">pnpm generate:feature invoicing invoice</div>
          <p className="text-[11px] text-muted-foreground">Then add Zod schema in @repo/contracts, register module in app.module.ts, run db:generate.</p>
        </div>
      </div>

      <Separator />
      <p className="text-center text-xs text-muted-foreground">B12 • Modular Monolith • 1-command theme • pnpm theme:apply → web+mobile+email</p>
    </div>
  );
}

export const Route = createFileRoute("/_dashboard/")({
  component: DashboardPage,
});

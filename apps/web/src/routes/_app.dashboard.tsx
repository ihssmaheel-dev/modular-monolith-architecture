import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Plus, Code2, ExternalLink } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { useLocaleStore } from "@/stores/locale.store";
import { getApiClient } from "@/lib/api";
import { notesListQuery } from "@/features/notes/notes.queries";
import { DashboardStatsGrid } from "@/components/dashboard/dashboard-stats-grid";
import { DashboardHighlights } from "@/components/dashboard/dashboard-highlights";
import { DashboardNotesCard } from "@/components/dashboard/dashboard-notes-card";
import { DashboardToolingDock } from "@/components/dashboard/dashboard-tooling-dock";

export const Route = createFileRoute("/_app/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(notesListQuery(1, 5)),
  pendingComponent: () => (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-xl bg-muted" />
    </div>
  ),
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const locale = useLocaleStore((state) => state.locale);

  const notesQuery = useQuery({ ...notesListQuery(1, 5), enabled: Boolean(user) });

  const healthQuery = useQuery({
    queryKey: ["health-status"],
    queryFn: async () => {
      try {
        const res = await fetch("http://localhost:3000/api/health/live");
        return res.ok ? "Healthy" : "Degraded";
      } catch {
        return "Connected";
      }
    },
    refetchInterval: 15000,
  });

  const tenancyStatusQuery = useQuery({
    queryKey: ["tenancy-status"],
    queryFn: async () => {
      try {
        const res = await getApiClient().tenancy.status();
        return res.status === 200 ? res.body : null;
      } catch {
        return null;
      }
    },
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex size-2 rounded-full bg-emerald-500 animate-ping" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live Architecture Cockpit
            </p>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {t("dashboard.welcome", { name: user?.name ?? "Engineer" })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("dashboard.subtitle")} · Operating in{" "}
            <strong className="text-foreground">{locale.toUpperCase()}</strong> locale
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            render={<a href="http://localhost:3000/api/docs" target="_blank" rel="noreferrer" />}
          >
            <Code2 className="size-3.5 text-primary" />
            <span>Scalar API Docs</span>
            <ExternalLink className="size-3 text-muted-foreground" />
          </Button>

          <Button size="sm" className="gap-1.5 text-xs shadow-xs" render={<Link to="/notes/new" />}>
            <Plus className="size-3.5" />
            <span>{t("notes.newNote")}</span>
          </Button>
        </div>
      </div>

      <DashboardStatsGrid
        apiStatus={healthQuery.data ?? "Healthy"}
        tenancyMode={
          tenancyStatusQuery.data?.mode
            ? tenancyStatusQuery.data.mode.toUpperCase()
            : "MULTI-TENANT"
        }
        userRole={user?.role ? user.role.toUpperCase() : "MEMBER"}
        notesTotal={notesQuery.data?.total ? String(notesQuery.data.total) : "0"}
      />

      <DashboardHighlights />

      <DashboardNotesCard
        isLoading={notesQuery.isLoading}
        isError={notesQuery.isError}
        notes={notesQuery.data?.items}
      />

      <DashboardToolingDock />
    </div>
  );
}

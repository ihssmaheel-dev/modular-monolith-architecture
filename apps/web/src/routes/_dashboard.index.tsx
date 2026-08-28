import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api";
import { Badge, Button, Separator } from "@repo/ui";
import { Plus, ArrowUpRight } from "lucide-react";
import { DashboardStats } from "@/components/features/dashboard/dashboard-stats";
import { RecentNotesPanel } from "@/components/features/dashboard/recent-notes-panel";
import { WorkspacePanel } from "@/components/features/dashboard/workspace-panel";

function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

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
    queryFn: async () => {
      const r = await api.tenancy.status();
      return r.status === 200 ? r.body : null;
    },
    staleTime: Infinity,
  });

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/10 text-primary font-medium px-2.5 py-0.5 text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> Live Workspace
            </Badge>
            <span className="text-xs text-muted-foreground">
              {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {t("dashboard.welcome", { name: "" }).replace(/^,?\s*/, "")} — {tenancy?.mode === "multi" ? "multi-tenant" : "single-tenant"} workspace.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/notes">
            <Button className="h-9 gap-2 font-medium shadow-sm">
              <Plus className="h-4 w-4" /> New Note
            </Button>
          </Link>
          <Link to="/users">
            <Button variant="outline" className="h-9 gap-2 bg-background">
              Manage Users <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </Link>
        </div>
      </div>

      <DashboardStats
        userTotal={usersData?.total}
        usersLoading={usersLoading}
        notesTotal={notesData?.total}
        notesCount={notesData?.items?.length ?? 0}
        tenancyMode={tenancy?.mode}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentNotesPanel items={notesData?.items} />
        </div>
        <WorkspacePanel />
      </div>

      <Separator className="my-2" />
      <p className="text-center text-xs text-muted-foreground">B12 Enterprise • Modular Monolith • Theme via <span className="font-mono text-foreground">pnpm theme:apply</span></p>
    </div>
  );
}

export const Route = createFileRoute("/_dashboard/")({
  component: DashboardPage,
});

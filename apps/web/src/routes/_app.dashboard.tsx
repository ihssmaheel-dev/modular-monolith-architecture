import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { FileText, ArrowRight, Users, Building2 } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { PageHeader } from "@repo/ui/components/composed/page-header";
import { useAuthStore } from "@/stores/auth.store";
import { notesListQuery } from "@/features/notes/notes.queries";

export const Route = createFileRoute("/_app/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(notesListQuery(1, 5)),
  pendingComponent: () => (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
    </div>
  ),
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const notesQuery = useQuery({ ...notesListQuery(1, 5), enabled: Boolean(user) });
  const stats = [
    { label: t("dashboard.stats.notes"), value: notesQuery.data?.total ?? "—", icon: FileText },
    { label: t("dashboard.stats.users"), value: "—", icon: Users },
    { label: t("tenancy.organization"), value: t("settings.activeTenant"), icon: Building2 },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title={t("dashboard.welcome", { name: user?.name })}
        description={t("dashboard.subtitle")}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <stat.icon className="size-4" />
                {stat.label}
              </CardDescription>
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{t("dashboard.recentNotes")}</CardTitle>
            <CardDescription>{t("notes.description")}</CardDescription>
          </div>
          <Button size="sm" render={<Link to="/notes" />}>
            {t("notes.title")}
            <ArrowRight className="size-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          {notesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : notesQuery.isError ? (
            <p className="text-sm text-destructive">{t("errors.networkError")}</p>
          ) : notesQuery.data?.items.length ? (
            <div className="divide-y rounded-lg border">
              {notesQuery.data.items.map((note) => (
                <div key={note.id} className="flex items-center justify-between gap-4 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{note.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{note.content}</p>
                  </div>
                  <Badge variant="outline" className="hidden shrink-0 sm:inline-flex">
                    {t("common.created")}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("notes.noNotes")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

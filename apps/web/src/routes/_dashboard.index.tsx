import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function DashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["users", { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT }],
    queryFn: async () => {
      const result = await (api.users.list as any)({ query: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT } });
      return result.body;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("dashboard.title")}</h2>
        <p className="text-muted-foreground">{t("dashboard.welcome")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Total Users</p>
          <p className="mt-2 text-3xl font-bold">{isLoading ? "..." : data?.total ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Active Now</p>
          <p className="mt-2 text-3xl font-bold">--</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Revenue</p>
          <p className="mt-2 text-3xl font-bold">$0</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Growth</p>
          <p className="mt-2 text-3xl font-bold">+0%</p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_dashboard/")({
  component: DashboardPage,
});

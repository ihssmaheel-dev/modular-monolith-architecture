import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useTranslation } from "react-i18next";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function DashboardPage() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useQuery({
    queryKey: ["users", { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT }],
    queryFn: async () => {
      const result = await api.users.list({
        query: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT },
      });
      if (result.status !== 200) throw new Error("USERS_FETCH_FAILED");
      return result.body;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("dashboard.title")}</h2>
        <p className="text-muted-foreground">
          {t("dashboard.welcome", { name: user?.name ?? "" })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">{t("dashboard.stats.users")}</p>
          <p className="mt-2 text-3xl font-bold">{isLoading ? "..." : (data?.total ?? 0)}</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            {t("dashboard.stats.activeSessions")}
          </p>
          <p className="mt-2 text-3xl font-bold">--</p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">
            {t("dashboard.stats.storage")}
          </p>
          <p className="mt-2 text-3xl font-bold">--</p>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_dashboard/")({
  component: DashboardPage,
});

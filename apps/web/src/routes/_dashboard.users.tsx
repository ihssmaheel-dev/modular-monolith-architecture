import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

function UsersPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-destructive/10 p-4 text-destructive">
        {t("users.loadFailed")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("users.title")}</h2>
        <p className="text-muted-foreground">{t("users.manage")}</p>
      </div>

      <div className="space-y-3">
        {data?.users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_dashboard/users")({
  component: UsersPage,
});

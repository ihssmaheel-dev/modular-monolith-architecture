import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsInteger } from "nuqs";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { Button, Card, Badge } from "@repo/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { UserListResponse } from "@repo/contracts";

function UsersPage() {
  const { t } = useTranslation();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));
  const { data, isLoading, error } = useQuery<UserListResponse>({
    queryKey: ["users", { page, limit }],
    queryFn: async () => {
      const r = await api.users.list({ query: { page, limit } });
      if (r.status !== 200) throw new Error("USERS_FETCH_FAILED");
      return r.body as UserListResponse;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <PageShell>
        <PageHeader eyebrow={t("users.eyebrow")} title={t("users.title")} description={t("users.manage")} />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted/60 border border-border/60" />
          ))}
        </div>
      </PageShell>
    );
  }
  if (error) return <PageShell><div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive font-medium text-center">{t("users.loadFailed")}</div></PageShell>;

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <PageShell>
      <PageHeader eyebrow={t("users.eyebrow")} title={t("users.title")} description={t("users.manage")} />
      <div className="space-y-3">
        {data?.users.map((u) => {
          const initials = (u.name || u.email || "U").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
          return (
            <Card key={u.id} className="flex items-center justify-between p-4 border-border/60 shadow-sm hover:shadow-md hover:border-border transition-all">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant="outline" className="text-[11px] font-mono hidden sm:inline-flex">{t("users.verified")}</Badge>
                <span className="text-[11px] text-muted-foreground font-mono hidden lg:inline">{u.id.slice(0, 8)}</span>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)} className="h-8 gap-1 bg-background">
          <ChevronLeft className="h-3.5 w-3.5" /> {t("common.previous")}
        </Button>
        <span className="text-xs text-muted-foreground font-medium">
          {t("common.pageOf", { page, totalPages })}
        </span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-8 gap-1 bg-background">
          {t("common.next")} <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </PageShell>
  );
}

export const Route = createFileRoute("/_dashboard/users")({ component: UsersPage });

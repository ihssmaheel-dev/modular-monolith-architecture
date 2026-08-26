import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useQueryState, parseAsInteger } from "nuqs";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";
import { Button, Card, Badge } from "@repo/ui";
import type { UserListResponse } from "@repo/contracts";
import { ChevronLeft, ChevronRight } from "lucide-react";

function UsersPage() {
  const { t } = useTranslation();
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit] = useQueryState("limit", parseAsInteger.withDefault(10));

  const { data, isLoading, error } = useQuery<UserListResponse>({
    queryKey: ["users", { page, limit }],
    queryFn: async () => {
      const result = await api.users.list({
        query: { page, limit },
      });
      if (result.status !== 200) throw new Error("USERS_FETCH_FAILED");
      return result.body as UserListResponse;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl mx-auto py-2">
        <div className="h-8 w-40 animate-pulse rounded-sm bg-muted" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-md bg-muted/60" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-destructive/20 bg-destructive/10 p-6 text-destructive text-sm font-medium">
        {t("users.loadFailed")}
      </div>
    );
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Header */}
      <div className="border-b border-border pb-6 space-y-1">
        <span className="eyebrow">Identity & Access</span>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("users.title")}</h1>
        <p className="text-muted-foreground text-sm">{t("users.manage")}</p>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {data?.users.map((u) => {
          const initials = u.name
            ? u.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "U";

          return (
            <Card
              key={u.id}
              className="flex items-center justify-between p-4 hover:border-foreground/40 transition-colors"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-secondary text-foreground font-semibold text-xs border border-border">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-tight">{u.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-[11px] font-mono">
                  Verified
                </Badge>
                <div className="text-[11px] text-muted-foreground font-mono hidden sm:inline">
                  {u.id.slice(0, 8)}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="text-xs"
        >
          <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Previous
        </Button>
        <span className="text-xs text-muted-foreground font-medium">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="text-xs"
        >
          Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_dashboard/users")({
  component: UsersPage,
});

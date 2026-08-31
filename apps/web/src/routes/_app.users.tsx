import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Users as UsersIcon } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { DataTable, type DataTableColumn } from "@repo/ui/components/composed/data-table";
import { EmptyState } from "@repo/ui/components/composed/empty-state";
import { PageHeader } from "@repo/ui/components/composed/page-header";
import { getApiClient } from "@/lib/api";
import type { UserResponse } from "@repo/contracts";

export const Route = createFileRoute("/_app/users")({
  component: UsersPage,
});

function UsersPage() {
  const { t } = useTranslation();
  const usersQuery = useQuery({
    queryKey: ["users-list"],
    queryFn: async () => {
      const res = await getApiClient().users.list();
      return res.status === 200
        ? res.body
        : { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };
    },
  });

  const columns: DataTableColumn<UserResponse>[] = [
    {
      key: "name",
      header: t("users.name"),
      cell: (row) => <span className="font-semibold text-foreground">{row.name}</span>,
    },
    {
      key: "email",
      header: t("users.email"),
      cell: (row) => <span className="text-muted-foreground font-mono text-xs">{row.email}</span>,
    },
    {
      key: "role",
      header: t("users.role"),
      cell: (row) => (
        <Badge
          variant={row.role === "ADMIN" || row.role === "OWNER" ? "default" : "secondary"}
          className="text-[10px] font-mono"
        >
          {row.role}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: t("users.created"),
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
      className: "hidden sm:table-cell",
    },
  ];

  return (
    <div className="w-full space-y-6">
      <PageHeader title={t("users.title")} description={t("users.description")} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="size-4" />
            <span>{t("users.title")}</span>
          </CardTitle>
          <Badge variant="secondary">
            {usersQuery.data?.total ?? "—"} {t("common.items")}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {usersQuery.isLoading ? (
            <div className="h-40 animate-pulse rounded-lg bg-muted" />
          ) : usersQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 p-6 text-sm text-destructive">
              {t("errors.networkError")}
              <Button
                variant="outline"
                size="sm"
                className="ms-4"
                onClick={() => usersQuery.refetch()}
              >
                {t("common.retry")}
              </Button>
            </div>
          ) : usersQuery.data?.items.length === 0 ? (
            <EmptyState
              icon={<UsersIcon className="size-8" />}
              title={t("users.noUsers")}
              description={t("users.description")}
            />
          ) : (
            <DataTable
              data={usersQuery.data?.items ?? []}
              columns={columns}
              getRowKey={(row) => row.id}
              isLoading={usersQuery.isFetching}
              emptyText={t("common.noResults")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Users as UsersIcon } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { DataTable, DataTablePagination } from "@repo/ui/components/composed/data-table";
import { EmptyState } from "@repo/ui/components/composed/empty-state";
import { PageHeader } from "@repo/ui/components/composed/page-header";
import { usersListQuery } from "@/features/users/users.queries";
import { getUsersColumns } from "@/features/users/components/users-table-columns";

export function UsersList({
  page,
  limit,
  onPageChange,
}: {
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  const usersQuery = useQuery({ ...usersListQuery(page, limit) });
  const columns = getUsersColumns(t);

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
          ) : usersQuery.data?.users.length === 0 ? (
            <EmptyState
              icon={<UsersIcon className="size-8" />}
              title={t("users.noUsers")}
              description={t("users.description")}
            />
          ) : (
            <>
              <DataTable
                data={usersQuery.data?.users ?? []}
                columns={columns}
                getRowKey={(row) => row.id}
                isLoading={usersQuery.isFetching}
                emptyText={t("common.noResults")}
              />
              {usersQuery.data && usersQuery.data.totalPages > 1 && (
                <DataTablePagination
                  page={page}
                  totalPages={usersQuery.data.totalPages}
                  onPageChange={onPageChange}
                  pageLabel={(current, total) =>
                    t("common.pageOf", { page: current, totalPages: total })
                  }
                  previousLabel={t("common.previous")}
                  nextLabel={t("common.next")}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

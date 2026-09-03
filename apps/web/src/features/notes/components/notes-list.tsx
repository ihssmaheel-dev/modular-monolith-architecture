import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { FileText, Plus } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { DataTable, DataTablePagination } from "@repo/ui/components/composed/data-table";
import { EmptyState } from "@repo/ui/components/composed/empty-state";
import { PageHeader } from "@repo/ui/components/composed/page-header";
import { FRONTEND_ROUTES } from "@repo/contracts";
import { notesListQuery } from "@/features/notes/notes.queries";
import { useDeleteNoteMutation } from "@/features/notes/notes.mutations";
import { getNotesColumns } from "@/features/notes/notes-table-columns";

export function NotesList({
  page,
  limit,
  onPageChange,
}: {
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation();
  const notesQuery = useQuery({ ...notesListQuery(page, limit) });
  const deleteMutation = useDeleteNoteMutation();
  const columns = getNotesColumns(t, (id) => deleteMutation.mutate(id));

  return (
    <div className="w-full space-y-6">
      <PageHeader
        title={t("notes.title")}
        description={t("notes.description")}
        actions={
          <Button render={<Link to={FRONTEND_ROUTES.newNote} />}>
            <Plus className="size-4" />
            {t("notes.newNote")}
          </Button>
        }
      />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-4" />
            {t("notes.title")}
          </CardTitle>
          <Badge variant="secondary">
            {notesQuery.data?.total ?? "—"} {t("common.items")}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {notesQuery.isLoading ? (
            <div className="h-40 animate-pulse rounded-lg bg-muted" />
          ) : notesQuery.isError ? (
            <div className="rounded-lg border border-destructive/30 p-6 text-sm text-destructive">
              {t("api.note.fetchFailed")}
              <Button
                variant="outline"
                size="sm"
                className="ms-4"
                onClick={() => notesQuery.refetch()}
              >
                {t("common.retry")}
              </Button>
            </div>
          ) : notesQuery.data?.items.length === 0 ? (
            <EmptyState
              icon={<FileText className="size-8" />}
              title={t("notes.noNotes")}
              description={t("notes.description")}
              action={
                <Button render={<Link to={FRONTEND_ROUTES.newNote} />}>
                  <Plus className="size-4" />
                  {t("notes.createNote")}
                </Button>
              }
            />
          ) : (
            <>
              <DataTable
                data={notesQuery.data?.items ?? []}
                columns={columns}
                getRowKey={(row) => row.id}
                isLoading={notesQuery.isFetching}
                emptyText={t("common.noResults")}
              />
              {notesQuery.data && notesQuery.data.totalPages > 1 && (
                <DataTablePagination
                  page={page}
                  totalPages={notesQuery.data.totalPages}
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

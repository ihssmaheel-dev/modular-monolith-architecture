import { Trash2 } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { ConfirmDialog } from "@repo/ui/components/composed/confirm-dialog";
import type { DataTableColumn } from "@repo/ui/components/composed/data-table";

export type NoteRow = { id: string; title: string; content: string; createdAt: string };

export function getNotesColumns(
  t: (key: string, opts?: Record<string, unknown>) => string,
  onDelete: (id: string) => void,
): DataTableColumn<NoteRow>[] {
  return [
    {
      key: "title",
      header: t("notes.noteTitle"),
      cell: (row) => <span className="font-medium">{row.title}</span>,
    },
    {
      key: "content",
      header: t("notes.content"),
      cell: (row) => <span className="line-clamp-2 text-muted-foreground">{row.content}</span>,
    },
    {
      key: "createdAt",
      header: t("common.created"),
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
      className: "hidden sm:table-cell",
    },
    {
      key: "actions",
      header: "",
      cell: (row) => (
        <ConfirmDialog
          title={t("common.delete")}
          description={t("notes.deleteConfirm", { title: row.title })}
          confirmText={t("common.delete")}
          cancelText={t("common.cancel")}
          pendingText={t("common.saving")}
          variant="destructive"
          onConfirm={() => onDelete(row.id)}
          trigger={
            <Button variant="ghost" size="icon-sm" aria-label={t("common.delete")}>
              <Trash2 className="size-3.5" />
            </Button>
          }
        />
      ),
      className: "w-12",
    },
  ];
}

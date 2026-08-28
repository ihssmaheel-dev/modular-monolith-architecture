import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter, Button, Spinner } from "@repo/ui";
import { Can } from "@/components/shared/Can";
import { useNotes, useDeleteNote } from "@/hooks/use-notes";
import { Trash2, FileText, Calendar } from "lucide-react";

export function NotesList() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useNotes();
  const del = useDeleteNote();
  const notes = data?.items ?? [];

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-12 gap-3">
      <Spinner label={t("common.loading")} />
      <span className="text-xs text-muted-foreground">{t("notes.loading")}</span>
    </div>
  );
  if (isError) return <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center text-sm text-destructive font-medium">{t("api.note.fetchFailed")}</div>;

  if (notes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background border shadow-sm text-muted-foreground">
          <FileText className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold">{t("notes.noNotes")}</p>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">Create a note to test optimistic 0ms update and tenant isolation.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {notes.map((n) => (
        <Card key={n.id} className="flex flex-col border-border/60 shadow-sm hover:shadow-md hover:border-border transition-all group">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-[15px] font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">{n.title}</CardTitle>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground font-mono shrink-0">
                <Calendar className="h-3 w-3" /> {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
            <CardDescription className="text-[11px] font-mono">ID {n.id.slice(0, 8)}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 py-0">
            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed line-clamp-3">{n.content}</p>
          </CardContent>
          <CardFooter className="flex justify-end pt-3 mt-3 border-t bg-muted/20 -mx-6 -mb-6 px-6 py-3 rounded-b-xl">
            <Can do="notes:delete">
              <Button variant="ghost" size="sm" onClick={() => del.mutate(n.id)} className="h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-1.5">
                <Trash2 className="h-3.5 w-3.5" /> {t("common.delete")}
              </Button>
            </Can>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

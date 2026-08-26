import { useTranslation } from "react-i18next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
  Button,
  Spinner,
} from "@repo/ui";
import { Can } from "@/components/shared/Can";
import { useNotes, useDeleteNote } from "@/hooks/use-notes";
import { Trash2, FileText, Calendar } from "lucide-react";

export function NotesList() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useNotes();
  const deleteMutation = useDeleteNote();

  const notes = data?.items ?? [];

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <Spinner label={t("common.loading")} />
        <span className="text-xs text-muted-foreground">Loading notes...</span>
      </div>
    );
  if (isError)
    return (
      <div className="rounded-sm border border-destructive/30 bg-destructive/10 p-6 text-center text-sm text-destructive font-medium">
        {t("api.note.fetchFailed")}
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {notes.length === 0 ? (
        <div className="col-span-full rounded-md border border-dashed border-border p-12 text-center space-y-3 bg-card/50">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-sm bg-secondary text-muted-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-foreground">{t("notes.noNotes")}</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Click "New Note" above to test the 0ms instant optimistic mutation update.
          </p>
        </div>
      ) : (
        notes.map((note) => (
          <Card key={note.id} className="flex flex-col justify-between hover:border-foreground/40 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg">{note.title}</CardTitle>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground shrink-0 font-mono">
                  <Calendar className="h-3 w-3" />
                  {new Date(note.createdAt).toLocaleDateString()}
                </div>
              </div>
              <CardDescription className="text-xs">ID: {note.id.slice(0, 8)}...</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 py-2">
              <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{note.content}</p>
            </CardContent>
            <CardFooter className="flex justify-end pt-3 border-t border-border mt-3">
              <Can do="notes:delete">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(note.id)}
                  className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  {t("common.delete")}
                </Button>
              </Can>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}

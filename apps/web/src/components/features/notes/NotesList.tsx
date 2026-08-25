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
      <div className="flex justify-center p-8">
        <Spinner label={t("common.loading")} />
      </div>
    );
  if (isError) return <div className="text-destructive text-center p-8">{t("api.note.fetchFailed")}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      {notes.length === 0 ? (
        <p className="text-muted-foreground col-span-full text-center py-8">{t("notes.noNotes")}</p>
      ) : (
        notes.map((note) => (
          <Card key={note.id} className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>{note.title}</CardTitle>
              <CardDescription>{new Date(note.createdAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{note.content}</p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Can do="notes:delete">
                <Button variant="destructive" size="sm" onClick={() => handleDelete(note.id)}>
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

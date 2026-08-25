import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
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
import type { NoteResponseDto } from "@repo/contracts";

export function NotesList() {
  const { t } = useTranslation();
  const [notes, setNotes] = useState<NoteResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    const { status, body } = await api.notes.getNotes({
      query: { page: 1, limit: 50 },
    });

    if (status === 200) {
      setNotes(body.items);
      setError(null);
    } else {
      setError(t("api.note.fetchFailed"));
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void fetchNotes();
  }, [fetchNotes]);

  const handleDelete = async (id: string) => {
    const { status } = await api.notes.deleteNote({ params: { id } });
    if (status === 204) {
      setNotes((current) => current.filter((note) => note.id !== id));
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Spinner label={t("common.loading")} />
      </div>
    );
  if (error) return <div className="text-destructive text-center p-8">{error}</div>;

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

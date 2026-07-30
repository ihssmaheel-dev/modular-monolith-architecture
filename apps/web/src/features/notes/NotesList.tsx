import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter, Button, Spinner } from "@repo/ui";
import { NoteResponseDto } from "@repo/shared";

export function NotesList() {
  const [notes, setNotes] = useState<NoteResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    setLoading(true);
    const { status, body } = await (api.notes.getNotes as any)({
      query: { page: "1", limit: "50" },
    });

    if (status === 200) {
      setNotes(body.items);
      setError(null);
    } else {
      setError("Failed to load notes");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleDelete = async (id: string) => {
    const { status } = await (api.notes.deleteNote as any)({ params: { id } });
    if (status === 204) {
      setNotes(notes.filter((note) => note.id !== id));
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;
  if (error) return <div className="text-destructive text-center p-8">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      {notes.length === 0 ? (
        <p className="text-muted-foreground col-span-full text-center py-8">No notes yet. Create one above!</p>
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
              <Button variant="destructive" size="sm" onClick={() => handleDelete(note.id)}>
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
}

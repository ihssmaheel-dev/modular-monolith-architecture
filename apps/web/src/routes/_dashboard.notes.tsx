import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { NotesList } from "../features/notes/NotesList";
import { CreateNoteForm } from "../features/notes/CreateNoteForm";
import { Button } from "@repo/ui";

export const Route = createFileRoute("/_dashboard/notes")({
  component: NotesRoute,
});

function NotesRoute() {
  const [showForm, setShowForm] = useState(false);
  // We use a refresh key to force the list to refetch when a new note is added
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground mt-2">Manage your end-to-end template notes here.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "New Note"}
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <CreateNoteForm onSuccess={handleSuccess} />
        </div>
      )}

      <NotesList key={refreshKey} />
    </div>
  );
}

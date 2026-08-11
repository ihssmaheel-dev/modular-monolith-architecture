import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NotesList } from "../components/features/notes/NotesList";
import { CreateNoteForm } from "../components/features/notes/CreateNoteForm";
import { Button } from "@repo/ui";
import { useTenantStore } from "@/stores/tenant.store";

export const Route = createFileRoute("/_dashboard/notes")({
  component: NotesRoute,
});

function NotesRoute() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const activeTenantId = useTenantStore((state) => state.activeTenantId);

  const handleSuccess = () => {
    setShowForm(false);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("notes.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("notes.description")}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? t("notes.cancel") : t("notes.newNote")}
        </Button>
      </div>

      {showForm && (
        <div className="mb-8">
          <CreateNoteForm key={activeTenantId} onSuccess={handleSuccess} />
        </div>
      )}

      <NotesList key={`${activeTenantId ?? "single"}:${refreshKey}`} />
    </div>
  );
}

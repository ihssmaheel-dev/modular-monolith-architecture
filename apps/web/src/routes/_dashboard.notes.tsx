import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NotesList } from "../components/features/notes/NotesList";
import { CreateNoteForm } from "../components/features/notes/CreateNoteForm";
import { Button } from "@repo/ui";
import { useTenantStore } from "@/stores/tenant.store";
import { Plus, X } from "lucide-react";

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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1.5">
          <span className="eyebrow">Domain Vertical Slice</span>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{t("notes.title")}</h1>
          <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">{t("notes.description")}</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
          size="sm"
          className="shrink-0 h-9 gap-1.5 font-medium"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" /> {t("notes.cancel")}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> {t("notes.newNote")}
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <div className="animate-in fade-in-50 duration-200">
          <CreateNoteForm key={activeTenantId} onSuccess={handleSuccess} />
        </div>
      )}

      <NotesList key={`${activeTenantId ?? "single"}:${refreshKey}`} />
    </div>
  );
}

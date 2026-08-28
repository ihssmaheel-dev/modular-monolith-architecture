import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NotesList } from "@/components/features/notes/NotesList";
import { CreateNoteForm } from "@/components/features/notes/CreateNoteForm";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@repo/ui";
import { Plus, X } from "lucide-react";
import { useTenantStore } from "@/stores/tenant.store";

export const Route = createFileRoute("/_dashboard/notes")({ component: NotesPage });

function NotesPage() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const tenant = useTenantStore((s) => s.activeTenantId);

  return (
    <PageShell>
      <PageHeader
        eyebrow={t("notes.eyebrow")}
        title={t("notes.title")}
        description={t("notes.description")}
        actions={
          <Button onClick={() => setOpen(!open)} variant={open ? "outline" : "default"} size="sm" className="h-9 gap-1.5 font-medium shadow-sm">
            {open ? <><X className="h-4 w-4" /> {t("notes.cancel")}</> : <><Plus className="h-4 w-4" /> {t("notes.newNote")}</>}
          </Button>
        }
      />
      {open && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <CreateNoteForm key={tenant} onSuccess={() => { setOpen(false); setTick((k) => k + 1); }} />
        </div>
      )}
      <NotesList key={`${tenant ?? "single"}:${tick}`} />
    </PageShell>
  );
}

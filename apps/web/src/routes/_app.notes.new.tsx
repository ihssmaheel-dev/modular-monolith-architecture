import { createFileRoute } from "@tanstack/react-router";
import { NoteCreateForm } from "@/features/notes/components/note-create-form";

export const Route = createFileRoute("/_app/notes/new")({ component: CreateNotePage });

function CreateNotePage() {
  return <NoteCreateForm />;
}

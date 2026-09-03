import { createFileRoute } from "@tanstack/react-router";
import { PaginationQuerySchema } from "@repo/contracts";
import { notesListQuery } from "@/features/notes/notes.queries";
import { NotesList } from "@/features/notes/components/notes-list";

export const Route = createFileRoute("/_app/notes")({
  validateSearch: PaginationQuerySchema,
  loaderDeps: ({ search }) => ({ page: search.page, limit: search.limit }),
  loader: ({ deps, context }) =>
    context.queryClient.ensureQueryData(notesListQuery(deps.page, deps.limit)),
  component: NotesPage,
});

function NotesPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <NotesList
      page={search.page ?? 1}
      limit={search.limit ?? 20}
      onPageChange={(next) => navigate({ search: (previous) => ({ ...previous, page: next }) })}
    />
  );
}

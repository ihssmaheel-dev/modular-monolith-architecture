import type {
  CreateNoteDto,
  NoteListResponseDto,
  NoteResponseDto,
  PaginationQuery,
  UpdateNoteDto,
} from "@repo/contracts";
import type { FetchFn } from "../types";
import { orpcResponse, type OrpcClient } from "../orpc";

export function createNotesClient(fetchFn: FetchFn, orpc?: OrpcClient) {
  const client = {
    getNotes: (req: { query?: PaginationQuery } = {}) => {
      if (orpc) {
        return orpcResponse(
          () => orpc.notes.list({ page: req.query?.page, limit: req.query?.limit }),
          200,
        );
      }
      const sp = new URLSearchParams();
      if (req.query?.page) sp.set("page", String(req.query.page));
      if (req.query?.limit) sp.set("limit", String(req.query.limit));
      const qs = sp.toString();
      return fetchFn<NoteListResponseDto>(`/notes${qs ? `?${qs}` : ""}`);
    },
    getNoteById: (req: { params: { id: string } }) =>
      orpc
        ? orpcResponse(() => orpc.notes.getById({ id: req.params.id }), 200)
        : fetchFn<NoteResponseDto>(`/notes/${encodeURIComponent(req.params.id)}`),
    createNote: (req: { body: CreateNoteDto }) =>
      orpc
        ? orpcResponse(() => orpc.notes.create(req.body), 201)
        : fetchFn<NoteResponseDto>("/notes", {
            method: "POST",
            body: JSON.stringify(req.body),
          }),
    updateNote: (req: { params: { id: string }; body: UpdateNoteDto }) =>
      orpc
        ? orpcResponse(() => orpc.notes.update({ id: req.params.id, ...req.body }), 200)
        : fetchFn<NoteResponseDto>(`/notes/${encodeURIComponent(req.params.id)}`, {
            method: "PATCH",
            body: JSON.stringify(req.body),
          }),
    deleteNote: (req: { params: { id: string } }) =>
      orpc
        ? orpcResponse(() => orpc.notes.delete({ id: req.params.id }), 204)
        : fetchFn<void>(`/notes/${encodeURIComponent(req.params.id)}`, { method: "DELETE" }),
  };

  // Keep ergonomic aliases while preserving the explicit HTTP method names.
  return {
    ...client,
    list: (input: { page?: number; limit?: number } = {}) =>
      client.getNotes({ query: { page: input.page ?? 1, limit: input.limit ?? 20 } }),
    get: (id: string) => client.getNoteById({ params: { id } }),
    create: client.createNote,
    update: (id: string, body: UpdateNoteDto) => client.updateNote({ params: { id }, body }),
    remove: (id: string) => client.deleteNote({ params: { id } }),
  };
}

import type {
  CreateNoteDto,
  NoteListResponseDto,
  NoteResponseDto,
  PaginationQuery,
  UpdateNoteDto,
} from "@repo/contracts";
import type { FetchFn } from "../types";

export function createNotesClient(fetchFn: FetchFn) {
  return {
    getNotes: (req: { query?: PaginationQuery } = {}) => {
      const sp = new URLSearchParams();
      if (req.query?.page) sp.set("page", String(req.query.page));
      if (req.query?.limit) sp.set("limit", String(req.query.limit));
      const qs = sp.toString();
      return fetchFn<NoteListResponseDto>(`/notes${qs ? `?${qs}` : ""}`);
    },
    getNoteById: (req: { params: { id: string } }) =>
      fetchFn<NoteResponseDto>(`/notes/${encodeURIComponent(req.params.id)}`),
    createNote: (req: { body: CreateNoteDto }) =>
      fetchFn<NoteResponseDto>("/notes", { method: "POST", body: JSON.stringify(req.body) }),
    updateNote: (req: { params: { id: string }; body: UpdateNoteDto }) =>
      fetchFn<NoteResponseDto>(`/notes/${encodeURIComponent(req.params.id)}`, {
        method: "PATCH",
        body: JSON.stringify(req.body),
      }),
    deleteNote: (req: { params: { id: string } }) =>
      fetchFn<void>(`/notes/${encodeURIComponent(req.params.id)}`, { method: "DELETE" }),
  };
}

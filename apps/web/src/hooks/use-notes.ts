import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useOptimisticMutation } from "./use-optimistic-mutation";
import type {
  CreateNoteDto,
  NoteListResponseDto,
  NoteResponseDto,
  PaginationQuery,
} from "@repo/contracts";

export const notesKeys = {
  all: ["notes"] as const,
  lists: () => [...notesKeys.all, "list"] as const,
  list: (query?: PaginationQuery) => [...notesKeys.lists(), query] as const,
  details: () => [...notesKeys.all, "detail"] as const,
  detail: (id: string) => [...notesKeys.details(), id] as const,
};

export function useNotes(query: PaginationQuery = { page: 1, limit: 50 }) {
  return useQuery({
    queryKey: notesKeys.list(query),
    queryFn: async () => {
      const res = await api.notes.getNotes({ query });
      if (res.status >= 400) throw new Error("Failed to fetch notes");
      return res.body;
    },
  });
}

export function useCreateNote(query: PaginationQuery = { page: 1, limit: 50 }) {
  return useOptimisticMutation<NoteResponseDto, CreateNoteDto, NoteListResponseDto>({
    queryKey: notesKeys.list(query),
    mutationFn: async (dto: CreateNoteDto) => {
      const res = await api.notes.createNote({ body: dto });
      if (res.status >= 400) {
        const message = (res.body as { message?: string })?.message || "Failed to create note";
        throw new Error(message);
      }
      return res.body;
    },
    updater: (old, dto) => {
      const optimisticNote: NoteResponseDto = {
        id: `temp-${String(Date.now())}`,
        title: dto.title,
        content: dto.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!old) {
        return {
          items: [optimisticNote],
          total: 1,
          page: 1,
          limit: query.limit ?? 50,
          totalPages: 1,
        };
      }
      return {
        ...old,
        items: [optimisticNote, ...old.items],
        total: old.total + 1,
      };
    },
  });
}

export function useDeleteNote(query: PaginationQuery = { page: 1, limit: 50 }) {
  return useOptimisticMutation<void, string, NoteListResponseDto>({
    queryKey: notesKeys.list(query),
    mutationFn: async (id: string) => {
      const res = await api.notes.deleteNote({ params: { id } });
      if (res.status >= 400) throw new Error("Failed to delete note");
    },
    updater: (old, id) => {
      if (!old) return { items: [], total: 0, page: 1, limit: 50, totalPages: 0 };
      return {
        ...old,
        items: old.items.filter((item) => item.id !== id),
        total: Math.max(0, old.total - 1),
      };
    },
  });
}

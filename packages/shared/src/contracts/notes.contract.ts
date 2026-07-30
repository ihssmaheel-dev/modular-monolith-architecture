import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { CreateNoteSchema, UpdateNoteSchema, NoteResponseSchema } from "../schemas/note.schema";

const c = initContract();

export const notesContract = c.router({
  createNote: {
    method: "POST" as const,
    path: "/notes",
    responses: {
      201: NoteResponseSchema as any,
      400: { message: "" } as any,
    },
    body: CreateNoteSchema as any,
    summary: "Create a new note",
  },
  getNotes: {
    method: "GET" as const,
    path: "/notes",
    responses: {
      200: z.object({
        items: z.array(NoteResponseSchema),
        total: z.number(),
        page: z.number(),
        totalPages: z.number(),
      }) as any,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: { page: undefined, limit: undefined } as any,
    summary: "Get paginated notes",
  },
  getNoteById: {
    method: "GET" as const,
    path: "/notes/:id",
    responses: {
      200: NoteResponseSchema as any,
      404: { message: "" } as any,
    },
    summary: "Get a note by ID",
  },
  updateNote: {
    method: "PATCH" as const,
    path: "/notes/:id",
    responses: {
      200: NoteResponseSchema as any,
      404: { message: "" } as any,
    },
    body: UpdateNoteSchema as any,
    summary: "Update a note",
  },
  deleteNote: {
    method: "DELETE" as const,
    path: "/notes/:id",
    responses: {
      204: undefined as any,
      404: { message: "" } as any,
    },
    body: undefined as any,
    summary: "Delete a note",
  },
});

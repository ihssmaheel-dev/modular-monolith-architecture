import { initContract, type AppRouter } from "@ts-rest/core";
import {
  CreateNoteSchema,
  NoteListResponseSchema,
  NoteResponseSchema,
  UpdateNoteSchema,
  NoteIdParamSchema,
} from "../schemas/note.schema";
import { MessageResponseSchema } from "../schemas/auth.schema";
import { PaginationQuerySchema } from "../schemas/pagination.schema";
import { contractSchema } from "./contract-schema";

const c = initContract();

export const notesContract = {
  createNote: {
    method: "POST" as const,
    path: "/notes",
    responses: {
      201: contractSchema(NoteResponseSchema),
      400: contractSchema(MessageResponseSchema),
    },
    body: contractSchema(CreateNoteSchema),
    summary: "Create a new note",
  },
  getNotes: {
    method: "GET" as const,
    path: "/notes",
    responses: {
      200: contractSchema(NoteListResponseSchema),
    },
    query: contractSchema(PaginationQuerySchema),
    summary: "Get paginated notes",
  },
  getNoteById: {
    method: "GET" as const,
    path: "/notes/:id",
    pathParams: contractSchema(NoteIdParamSchema),
    responses: {
      200: contractSchema(NoteResponseSchema),
      404: contractSchema(MessageResponseSchema),
    },
    summary: "Get a note by ID",
  },
  updateNote: {
    method: "PATCH" as const,
    path: "/notes/:id",
    pathParams: contractSchema(NoteIdParamSchema),
    responses: {
      200: contractSchema(NoteResponseSchema),
      404: contractSchema(MessageResponseSchema),
    },
    body: contractSchema(UpdateNoteSchema),
    summary: "Update a note",
  },
  deleteNote: {
    method: "DELETE" as const,
    path: "/notes/:id",
    pathParams: contractSchema(NoteIdParamSchema),
    responses: {
      204: c.noBody(),
      404: contractSchema(MessageResponseSchema),
    },
    summary: "Delete a note",
  },
} as const satisfies AppRouter;

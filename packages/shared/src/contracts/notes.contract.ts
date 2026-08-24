import { oc } from "@orpc/contract";
import {
  CreateNoteSchema,
  NoteListResponseSchema,
  NoteResponseSchema,
  UpdateNoteSchema,
  NoteIdParamSchema,
} from "../schemas/note.schema";
import { PaginationQuerySchema } from "../schemas/pagination.schema";
import { z } from "zod";

export const notesContract = oc.prefix("/notes").router({
  list: oc
    .route({ method: "GET", path: "/", summary: "Get paginated notes" })
    .input(PaginationQuerySchema)
    .output(NoteListResponseSchema),
  getById: oc
    .route({ method: "GET", path: "/:id", summary: "Get a note by ID" })
    .input(NoteIdParamSchema)
    .output(NoteResponseSchema),
  create: oc
    .route({ method: "POST", path: "/", summary: "Create a new note" })
    .input(CreateNoteSchema)
    .output(NoteResponseSchema),
  update: oc
    .route({ method: "PATCH", path: "/:id", summary: "Update a note" })
    .input(NoteIdParamSchema.and(UpdateNoteSchema))
    .output(NoteResponseSchema),
  delete: oc
    .route({ method: "DELETE", path: "/:id", summary: "Delete a note" })
    .input(NoteIdParamSchema)
    .output(z.undefined().or(z.null()).or(z.void())),
});

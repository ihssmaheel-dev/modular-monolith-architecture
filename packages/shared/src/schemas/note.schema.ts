import { z } from "zod";

export const CreateNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  content: z.string().min(1, "Content is required"),
});

export const UpdateNoteSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).optional(),
});

export const NoteResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateNoteDto = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteDto = z.infer<typeof UpdateNoteSchema>;
export type NoteResponseDto = z.infer<typeof NoteResponseSchema>;

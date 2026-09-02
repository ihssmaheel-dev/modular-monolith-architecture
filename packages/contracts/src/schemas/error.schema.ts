import { z } from "zod";

export const FieldErrorsSchema = z.record(z.string(), z.array(z.string()));

export const RetryMetadataSchema = z.object({
  retryable: z.boolean(),
  retryAfterMs: z.number().int().nonnegative().optional(),
});

export const ApiErrorEnvelopeSchema = z.object({
  code: z.string().min(1),
  i18nKey: z.string().min(1),
  message: z.string().min(1),
  status: z.number().int().min(400).max(599),
  requestId: z.string().min(1),
  fieldErrors: FieldErrorsSchema,
  retry: RetryMetadataSchema.optional(),
});

export type FieldErrors = z.infer<typeof FieldErrorsSchema>;
export type RetryMetadata = z.infer<typeof RetryMetadataSchema>;
export type ApiErrorEnvelope = z.infer<typeof ApiErrorEnvelopeSchema>;

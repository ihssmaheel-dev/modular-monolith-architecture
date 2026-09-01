import { z } from "zod";

/** Versioned envelope used when an outbox row crosses the durable queue boundary. */
export const OutboxEventEnvelopeSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
  version: z.number().int().positive(),
  tenantId: z.string().min(1).optional(),
  payload: z.unknown(),
});

export type OutboxEventEnvelope = z.infer<typeof OutboxEventEnvelopeSchema>;

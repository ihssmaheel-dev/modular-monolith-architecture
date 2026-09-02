import { SetMetadata } from "@nestjs/common";
import type { z } from "zod";

export const RESPONSE_SCHEMA_KEY = "responseSchema";

export const ResponseSchema = (schema: z.ZodType): MethodDecorator =>
  SetMetadata(RESPONSE_SCHEMA_KEY, schema);

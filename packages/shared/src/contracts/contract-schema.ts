import type { ContractPlainType } from "@ts-rest/core";
import type { z } from "zod";

export function contractSchema<TSchema extends z.ZodType>(
  schema: TSchema,
): ContractPlainType<z.output<TSchema>> {
  return schema as unknown as ContractPlainType<z.output<TSchema>>;
}

import { z } from "zod";
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from "../constants";

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

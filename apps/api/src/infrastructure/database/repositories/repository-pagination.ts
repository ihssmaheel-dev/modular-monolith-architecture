import type { Model } from "mongoose";
import type { ClsService } from "nestjs-cls";
import { ok, type Result } from "neverthrow";
import { applyOptions, applySoftDelete, getSession } from "./repository-options";
import type { PaginatedResult, PaginationOptions } from "./repository.types";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export async function paginateEntities<TEntity, TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  mapper: (value: unknown) => TEntity,
  filter: Record<string, unknown>,
  options: PaginationOptions,
): Promise<Result<PaginatedResult<TEntity>, never>> {
  const page = Math.max(DEFAULT_PAGE, options.page ?? DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, options.limit ?? DEFAULT_LIMIT));
  const softFilter = applySoftDelete(filter, options);
  const query = applyOptions(
    model.find(softFilter),
    { ...options, skip: (page - 1) * limit, limit },
    cls,
  );
  const [documents, total] = await Promise.all([
    query.exec(),
    model
      .countDocuments(softFilter)
      .session(options.session ?? getSession(cls) ?? null)
      .exec(),
  ]);
  const totalPages = Math.ceil(total / limit) || 1;
  return ok({
    items: documents.map(mapper),
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
}

import type { Model } from "mongoose";
import type { ClsService } from "nestjs-cls";
import { ok, type Result } from "neverthrow";
import { applyOptions, applySoftDelete, getSession } from "./repository-options";
import { applyRepositoryScope, type RepositoryScope } from "./repository-scope";
import type { BaseFindOptions, Id } from "./repository.types";

type Mapper<TEntity> = (value: unknown) => TEntity;

export async function findEntityById<TEntity, TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  mapper: Mapper<TEntity>,
  scope: RepositoryScope,
  id: Id,
  options: BaseFindOptions,
): Promise<Result<TEntity | null, never>> {
  return findOneEntity(model, cls, mapper, scope, { _id: id }, options);
}

export async function findOneEntity<TEntity, TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  mapper: Mapper<TEntity>,
  scope: RepositoryScope,
  filter: Record<string, unknown>,
  options: BaseFindOptions,
): Promise<Result<TEntity | null, never>> {
  const scoped = applyRepositoryScope(filter, scope, cls);
  const query = applyOptions(model.findOne(applySoftDelete(scoped, options)), options, cls);
  const document = await query.exec();
  return ok(document ? mapper(document) : null);
}

export async function findEntities<TEntity, TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  mapper: Mapper<TEntity>,
  scope: RepositoryScope,
  filter: Record<string, unknown>,
  options: BaseFindOptions,
): Promise<Result<TEntity[], never>> {
  const scoped = applyRepositoryScope(filter, scope, cls);
  const query = applyOptions(model.find(applySoftDelete(scoped, options)), options, cls);
  const documents = await query.exec();
  return ok(documents.map(mapper));
}

export async function entityExists<TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  scope: RepositoryScope,
  filter: Record<string, unknown>,
  options: BaseFindOptions,
): Promise<Result<boolean, never>> {
  const scoped = applyRepositoryScope(filter, scope, cls);
  const result = await model
    .exists(applySoftDelete(scoped, options))
    .session(options.session ?? getSession(cls) ?? null);
  return ok(Boolean(result));
}

export async function countEntities<TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  scope: RepositoryScope,
  filter: Record<string, unknown>,
  options: BaseFindOptions,
): Promise<Result<number, never>> {
  const scoped = applyRepositoryScope(filter, scope, cls);
  const total = await model
    .countDocuments(applySoftDelete(scoped, options))
    .session(options.session ?? getSession(cls) ?? null)
    .exec();
  return ok(total);
}

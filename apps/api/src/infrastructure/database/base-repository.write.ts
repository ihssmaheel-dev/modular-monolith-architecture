import type { Model } from "mongoose";
import type { ClsService } from "nestjs-cls";
import { err, ok, type Result } from "neverthrow";
import type { CreateOptions, Id, UpdateOptions } from "./base-repository.types";
import {
  applyAuditOnCreate,
  applyAuditOnUpdate,
  applyOptions,
  applySoftDelete,
  getSession,
} from "./base-repository.helpers";

type Mapper<TEntity> = (value: unknown) => TEntity;
type Conflict = { type: "CONFLICT" };

export async function createEntity<TEntity, TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  mapper: Mapper<TEntity>,
  data: Record<string, unknown>,
  options: CreateOptions,
): Promise<Result<TEntity, never>> {
  const payload = applyAuditOnCreate(data, options.audit !== false, cls);
  const doc = new model(payload as Partial<TDocument>);
  await doc.save({ session: options.session ?? getSession(cls) });
  return ok(mapper(doc));
}

export async function createManyEntities<TEntity, TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  mapper: Mapper<TEntity>,
  data: Record<string, unknown>[],
  options: CreateOptions,
): Promise<Result<TEntity[], never>> {
  const payloads = data.map((item) => applyAuditOnCreate(item, options.audit !== false, cls));
  const docs = await model.insertMany(payloads, {
    session: options.session ?? getSession(cls),
    ordered: true,
  });
  return ok(docs.map((doc) => mapper(doc)));
}

export async function updateEntity<TEntity, TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  mapper: Mapper<TEntity>,
  filter: Record<string, unknown>,
  update: Record<string, unknown>,
  options: UpdateOptions,
  applyDeleteFilter: boolean,
): Promise<Result<TEntity | null, Conflict>> {
  const queryFilter = applyDeleteFilter ? applySoftDelete(filter, options) : filter;
  if (typeof options.version === "number") queryFilter.__v = options.version;
  const finalUpdate = applyAuditOnUpdate(update, options.audit !== false, cls);
  let query = model.findOneAndUpdate(queryFilter, finalUpdate, {
    new: options.new ?? true,
    upsert: options.upsert ?? false,
    runValidators: options.runValidators ?? true,
    session: options.session ?? getSession(cls),
  });
  query = applyOptions(query, options, cls);
  const result = await query.exec();
  if (typeof options.version === "number" && !result) return err({ type: "CONFLICT" });
  return ok(result ? mapper(result) : null);
}

export async function deleteEntity<TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  id: Id,
  options: UpdateOptions,
): Promise<Result<boolean, never>> {
  const result = await model
    .findByIdAndDelete(id, { session: options.session ?? getSession(cls) })
    .exec();
  return ok(Boolean(result));
}

export async function softDeleteEntity<TEntity, TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  mapper: Mapper<TEntity>,
  id: Id,
  options: UpdateOptions,
): Promise<Result<TEntity | null, never>> {
  const result = await updateEntity(
    model,
    cls,
    mapper,
    { _id: id },
    { deletedAt: new Date() },
    options,
    false,
  );
  return result.isErr() ? ok(null) : ok(result.value);
}

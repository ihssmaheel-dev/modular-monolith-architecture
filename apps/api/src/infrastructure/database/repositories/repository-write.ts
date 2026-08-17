import type { Model } from "mongoose";
import type { ClsService } from "nestjs-cls";
import { err, ok, type Result } from "neverthrow";
import {
  applyAuditOnCreate,
  applyAuditOnUpdate,
  applyOptions,
  applySoftDelete,
  getSession,
} from "./repository-options";
import type { CreateOptions, DeleteOptions, UpdateOptions } from "./repository.types";

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
  const document = new model(payload as Partial<TDocument>);
  await document.save({ session: options.session ?? getSession(cls) });
  return ok(mapper(document));
}

export async function createManyEntities<TEntity, TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  mapper: Mapper<TEntity>,
  data: Record<string, unknown>[],
  options: CreateOptions,
): Promise<Result<TEntity[], never>> {
  const payloads = data.map((item) => applyAuditOnCreate(item, options.audit !== false, cls));
  const documents = await model.insertMany(payloads, {
    session: options.session ?? getSession(cls),
    ordered: true,
  });
  return ok(documents.map((document) => mapper(document)));
}

export async function updateEntity<TEntity, TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  mapper: Mapper<TEntity>,
  filter: Record<string, unknown>,
  update: Record<string, unknown>,
  options: UpdateOptions,
): Promise<Result<TEntity | null, Conflict>> {
  const queryFilter = applySoftDelete(filter, options);
  if (typeof options.version === "number") queryFilter.__v = options.version;
  const finalUpdate = applyAuditOnUpdate(update, options.audit !== false, cls);
  const query = applyOptions(
    model.findOneAndUpdate(queryFilter, finalUpdate, {
      returnDocument: options.new === false ? "before" : "after",
      upsert: options.upsert ?? false,
      runValidators: options.runValidators ?? true,
      session: options.session ?? getSession(cls),
    }),
    options,
    cls,
  );
  const result = await query.exec();
  if (typeof options.version === "number" && !result) return err({ type: "CONFLICT" });
  return ok(result ? mapper(result) : null);
}

export async function deleteEntity<TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  filter: Record<string, unknown>,
  options: DeleteOptions,
): Promise<Result<boolean, never>> {
  const result = await model
    .findOneAndDelete(applySoftDelete(filter, options), {
      session: options.session ?? getSession(cls),
    })
    .exec();
  return ok(Boolean(result));
}

export async function softDeleteEntity<TEntity, TDocument>(
  model: Model<TDocument>,
  cls: ClsService | undefined,
  mapper: Mapper<TEntity>,
  filter: Record<string, unknown>,
  options: UpdateOptions,
): Promise<Result<TEntity | null, never>> {
  const result = await updateEntity(model, cls, mapper, filter, { deletedAt: new Date() }, options);
  return result.isErr() ? ok(null) : ok(result.value);
}

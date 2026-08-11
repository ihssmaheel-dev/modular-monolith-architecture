import type { ClientSession, Query } from "mongoose";
import type { ClsService } from "nestjs-cls";
import type { BaseFindOptions } from "./repository.types";

type DataRecord = Record<string, unknown>;

export function applySoftDelete(
  filter: DataRecord,
  options: Pick<BaseFindOptions, "includeDeleted" | "onlyDeleted"> = {},
): DataRecord {
  if (options.onlyDeleted) {
    return { ...filter, deletedAt: { $exists: true, $ne: null } };
  }
  if (options.includeDeleted) return filter;
  return { ...filter, deletedAt: { $exists: false } };
}

export function applyOptions<TResult, TDocument>(
  query: Query<TResult, TDocument>,
  options: BaseFindOptions,
  cls?: ClsService,
): Query<TResult, TDocument> {
  if (options.select) query.select(options.select);
  if (options.populate) applyPopulate(query, options.populate);
  if (options.sort) query.sort(options.sort);
  if (options.lean !== false) query.lean();
  if (typeof options.limit === "number") query.limit(options.limit);
  if (typeof options.skip === "number") query.skip(options.skip);
  const session = options.session ?? getSession(cls);
  if (session) query.session(session);
  return query;
}

export function applyAuditOnCreate(
  data: DataRecord,
  enabled: boolean,
  cls?: ClsService,
): DataRecord {
  if (!enabled || !cls) return data;
  const userId = cls.get("userId");
  return userId ? { ...data, createdBy: userId, updatedBy: userId } : data;
}

export function applyAuditOnUpdate(
  update: DataRecord,
  enabled: boolean,
  cls?: ClsService,
): DataRecord {
  if (!enabled || !cls) return update;
  const userId = cls.get("userId");
  if (!userId) return update;
  if (isDataRecord(update.$set)) {
    return { ...update, $set: { ...update.$set, updatedBy: userId } };
  }
  return { ...update, updatedBy: userId };
}

export function getSession(cls?: ClsService): ClientSession | undefined {
  return cls?.get("mongoSession") ?? undefined;
}

function isDataRecord(value: unknown): value is DataRecord {
  return typeof value === "object" && value !== null;
}

function applyPopulate<TResult, TDocument>(
  query: Query<TResult, TDocument>,
  populate: NonNullable<BaseFindOptions["populate"]>,
): void {
  if (typeof populate === "string") {
    query.populate({ path: populate });
    return;
  }
  const values = Array.isArray(populate) ? populate : [populate];
  query.populate(values.map((value) => (typeof value === "string" ? { path: value } : value)));
}

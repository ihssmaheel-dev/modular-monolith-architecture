import { ClientSession, Query } from "mongoose";
import { ClsService } from "nestjs-cls";
import { BaseFindOptions } from "./base-repository.types";

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
  initialQuery: Query<TResult, TDocument>,
  options: BaseFindOptions,
  cls?: ClsService,
): Query<TResult, TDocument> {
  if (options.select) initialQuery.select(options.select);
  if (options.populate) applyPopulate(initialQuery, options.populate);
  if (options.sort) initialQuery.sort(options.sort);
  if (options.lean !== false) initialQuery.lean();
  if (typeof options.limit === "number") initialQuery.limit(options.limit);
  if (typeof options.skip === "number") initialQuery.skip(options.skip);
  const session = options.session ?? getSession(cls);
  if (session) initialQuery.session(session);
  return initialQuery;
}

export function applyAuditOnCreate(
  data: DataRecord,
  enabled: boolean,
  cls?: ClsService,
): DataRecord {
  if (!enabled || !cls) return data;
  const userId = cls.get("userId");
  if (!userId) return data;
  return { ...data, createdBy: userId, updatedBy: userId };
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

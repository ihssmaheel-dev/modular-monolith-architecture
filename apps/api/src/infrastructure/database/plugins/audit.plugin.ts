import { EventEmitter2 } from "@nestjs/event-emitter";
import { Schema } from "mongoose";
import { ClsServiceManager } from "nestjs-cls";
import { DatabaseMutatedEvent } from "../../audit/audit.listener";

export interface AuditPluginOptions {
  eventEmitter: EventEmitter2;
}

interface QueryResult {
  lean(): { exec(): Promise<unknown> };
}

interface AuditModel {
  findById(id: unknown): QueryResult;
  findOne(filter: unknown): QueryResult;
}

interface AuditContext {
  isNew?: boolean;
  _id?: unknown;
  $locals?: Record<string, unknown>;
  model?: AuditModel;
  getQuery?(): unknown;
  constructor?: unknown;
}

interface MiddlewareSchema {
  pre(operation: string, handler: (this: AuditContext) => void | Promise<void>): void;
  post(operation: string, handler: (this: AuditContext, result: unknown) => void): void;
}

const beforeSnapshots = new WeakMap<object, unknown>();
const auditActions = new WeakMap<object, "CREATE" | "UPDATE">();
const SENSITIVE_FIELDS = new Set(["passwordHash", "passwordResetTokenHash"]);

export function auditPlugin(schema: Schema, options: AuditPluginOptions): void {
  const middleware = schema as unknown as MiddlewareSchema;

  middleware.pre("save", async function () {
    auditActions.set(this, this.isNew ? "CREATE" : "UPDATE");
    if (this.isNew) return;
    const model = getModel(this);
    if (!model) return;
    const before = await safeQuery(() => model.findById(this._id));
    beforeSnapshots.set(this, before);
  });
  middleware.post("save", function (result) {
    const action = auditActions.get(this) ?? "UPDATE";
    emitAuditEvent(result, action, beforeSnapshots.get(this), toPlain(result), options);
    beforeSnapshots.delete(this);
    auditActions.delete(this);
  });

  registerQueryAudit(middleware, "findOneAndUpdate", "UPDATE", options);
  registerQueryAudit(middleware, "findOneAndDelete", "DELETE", options);
}

function registerQueryAudit(
  schema: MiddlewareSchema,
  operation: string,
  action: "UPDATE" | "DELETE",
  options: AuditPluginOptions,
): void {
  schema.pre(operation, async function () {
    if (!this.model || !this.getQuery) return;
    const before = await safeQuery(() => this.model!.findOne(this.getQuery!()));
    beforeSnapshots.set(this, before);
  });
  schema.post(operation, function (result) {
    if (!result) return;
    const after = action === "DELETE" ? null : toPlain(result);
    emitAuditEvent(result, action, beforeSnapshots.get(this), after, options);
    beforeSnapshots.delete(this);
  });
}

async function safeQuery(build: () => QueryResult): Promise<unknown> {
  try {
    return await build().lean().exec();
  } catch {
    return null;
  }
}

function emitAuditEvent(
  document: unknown,
  action: "CREATE" | "UPDATE" | "DELETE",
  before: unknown,
  after: unknown,
  options: AuditPluginOptions,
): void {
  const collectionName = getCollectionName(document);
  const documentId = getDocumentId(document);
  if (!collectionName || collectionName === "audit_logs" || !documentId) return;
  const event = new DatabaseMutatedEvent(
    collectionName,
    documentId,
    action,
    getActorId(),
    sanitizeAuditValue(before),
    sanitizeAuditValue(after),
  );
  options.eventEmitter.emit("database.mutated", event);
}

function getModel(context: AuditContext): AuditModel | null {
  const constructor = context.constructor as { findById?: AuditModel["findById"] } | undefined;
  return constructor?.findById ? (constructor as AuditModel) : null;
}

function toPlain(value: unknown): unknown {
  if (typeof value !== "object" || value === null) return value;
  const document = value as { toObject?: () => unknown };
  return document.toObject ? document.toObject() : value;
}

function getCollectionName(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return null;
  const document = value as { collection?: { name?: unknown }; constructor?: unknown };
  if (typeof document.collection?.name === "string") return document.collection.name;
  const constructor = document.constructor as { collection?: { name?: unknown } } | undefined;
  return typeof constructor?.collection?.name === "string" ? constructor.collection.name : null;
}

function getDocumentId(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("_id" in value)) return null;
  const id = value._id;
  return id === null || id === undefined ? null : String(id);
}

function getActorId(): string | undefined {
  try {
    const cls = ClsServiceManager.getClsService();
    return cls?.isActive() ? cls.get("userId") : undefined;
  } catch {
    return undefined;
  }
}

function sanitizeAuditValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeAuditValue);
  if (typeof value !== "object" || value === null) return value;
  const sanitized: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!SENSITIVE_FIELDS.has(key)) sanitized[key] = sanitizeAuditValue(item);
  }
  return sanitized;
}

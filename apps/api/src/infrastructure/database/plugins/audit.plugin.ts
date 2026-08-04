import { Schema, Document } from "mongoose";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ClsServiceManager } from "nestjs-cls";
import { DatabaseMutatedEvent } from "../../audit/audit.listener";

export interface AuditPluginOptions {
  eventEmitter: EventEmitter2;
}

export function auditPlugin(schema: Schema, options: AuditPluginOptions) {
  // --- CREATE / UPDATE (via save) ---
  schema.pre("save", async function () {
    const isNew = this.isNew;
    this.$locals.auditAction = isNew ? "CREATE" : "UPDATE";

    if (!isNew) {
      // Fetch the previous state directly from the DB
      try {
        const model = this.constructor as any;
        const before = await model.findById(this._id).lean().exec();
        this.$locals.auditBefore = before;
      } catch (err) {
        // Ignore error if fetching original fails, though ideally we log it
      }
    }
  });

  schema.post("save", function (doc: Document) {
    const action = (this.$locals.auditAction as "CREATE" | "UPDATE") || "UPDATE";
    emitAuditEvent(doc, action, this.$locals.auditBefore, doc.toObject(), options.eventEmitter);
  });

  // --- UPDATE (via findOneAndUpdate / updateOne) ---
  schema.pre(["findOneAndUpdate", "updateOne"], async function () {
    // Fetch the document BEFORE the update is applied
    try {
      const model = (this as any).model;
      const before = await model.findOne(this.getQuery()).lean().exec();
      (this as any).$locals = (this as any).$locals || {};
      (this as any).$locals.auditBefore = before;
    } catch (err) {
      // Ignore
    }
  });

  schema.post(["findOneAndUpdate", "updateOne"], async function (result: any) {
    if (result) {
      // Note: If options.new = true was not used, `result` might be the old document.
      // But BaseRepository always uses options.new = true, so result is the AFTER state.
      // Wait, Mongoose post('updateOne') does not return the document.
      // But post('findOneAndUpdate') does. BaseRepository uses findOneAndUpdate.
      
      const after = result.toObject ? result.toObject() : result;
      // Upsert
      const action: "CREATE" | "UPDATE" = (this as any).$locals?.auditBefore ? "UPDATE" : "CREATE";
      emitAuditEvent(result, action, (this as any).$locals?.auditBefore, after, options.eventEmitter);
    }
  });

  // --- DELETE (via findOneAndDelete) ---
  schema.pre("findOneAndDelete", async function () {
    try {
      const model = (this as any).model;
      const before = await model.findOne(this.getQuery()).lean().exec();
      (this as any).$locals = (this as any).$locals || {};
      (this as any).$locals.auditBefore = before;
    } catch (err) {
      // Ignore
    }
  });

  schema.post("findOneAndDelete", function (result: any) {
    if (result) {
      emitAuditEvent(result, "DELETE", (this as any).$locals?.auditBefore, null, options.eventEmitter);
    }
  });
}

function emitAuditEvent(
  doc: Document | any,
  action: "CREATE" | "UPDATE" | "DELETE",
  before: any,
  after: any,
  eventEmitter: EventEmitter2
) {
  // IMPORTANT: Ignore the audit_logs collection to prevent infinite loops!
  const collectionName = doc.collection?.name || doc.constructor?.collection?.name;
  if (!collectionName || collectionName === "audit_logs") return;

  const documentId = doc._id ? doc._id.toString() : null;
  if (!documentId) return;

  // Attempt to extract the user from the global ClsService
  let actorId: string | undefined;
  try {
    const cls = ClsServiceManager.getClsService();
    if (cls && cls.isActive()) {
      actorId = cls.get("userId");
    }
  } catch (err) {
    // CLS not active, ignore
  }

  // Sanitize big objects or sensitive data if necessary, but full snapshot is required for compliance
  const event = new DatabaseMutatedEvent(collectionName, documentId, action, actorId, before, after);
  eventEmitter.emit("database.mutated", event);
}

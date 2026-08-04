import { Injectable, Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLogMongooseSchema } from "./schemas/audit-log.mongoose.schema";

export class DatabaseMutatedEvent {
  constructor(
    public readonly collectionName: string,
    public readonly documentId: string,
    public readonly action: "CREATE" | "UPDATE" | "DELETE",
    public readonly actorId: string | undefined,
    public readonly before: any,
    public readonly after: any,
  ) {}
}

@Injectable()
export class AuditListener {
  private readonly logger = new Logger(AuditListener.name);

  constructor(
    @InjectModel(AuditLogMongooseSchema.name)
    private readonly auditLogModel: Model<AuditLogMongooseSchema>,
  ) {}

  @OnEvent("database.mutated", { async: true })
  async handleDatabaseMutatedEvent(event: DatabaseMutatedEvent) {
    try {
      await this.auditLogModel.create({
        collectionName: event.collectionName,
        documentId: event.documentId,
        action: event.action,
        actorId: event.actorId,
        before: event.before,
        after: event.after,
      });
    } catch (error) {
      // Audit failures must not crash the application, but should be heavily alerted
      this.logger.error(
        `Failed to save audit log for ${event.collectionName}:${event.documentId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}

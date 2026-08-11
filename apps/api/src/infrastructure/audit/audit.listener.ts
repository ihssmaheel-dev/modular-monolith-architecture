import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AuditLogMongooseSchema } from "./schemas/audit-log.mongoose.schema";
import { PinoLoggerService } from "../logger/logger.service";

export class DatabaseMutatedEvent {
  constructor(
    public readonly collectionName: string,
    public readonly documentId: string,
    public readonly action: "CREATE" | "UPDATE" | "DELETE",
    public readonly actorId: string | undefined,
    public readonly tenantId: string | undefined,
    public readonly before: unknown,
    public readonly after: unknown,
  ) {}
}

@Injectable()
export class AuditListener {
  private readonly logger: PinoLoggerService;

  constructor(
    @InjectModel(AuditLogMongooseSchema.name)
    private readonly auditLogModel: Model<AuditLogMongooseSchema>,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "AuditListener" });
  }

  @OnEvent("database.mutated", { async: true })
  async handleDatabaseMutatedEvent(event: DatabaseMutatedEvent): Promise<void> {
    try {
      await this.auditLogModel.create({
        collectionName: event.collectionName,
        documentId: event.documentId,
        action: event.action,
        actorId: event.actorId,
        tenantId: event.tenantId,
        before: event.before,
        after: event.after,
      });
    } catch (error) {
      // Audit failures must not crash the application, but should be heavily alerted
      this.logger.error(
        {
          error,
          collectionName: event.collectionName,
          documentId: event.documentId,
        },
        "Failed to save audit log",
      );
    }
  }
}

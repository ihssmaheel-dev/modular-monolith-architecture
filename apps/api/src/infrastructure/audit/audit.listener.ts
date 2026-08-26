import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DatabaseService } from "../database";
import { auditLogs } from "./schemas/audit.schema";
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
    private readonly database: DatabaseService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "AuditListener" });
  }

  @OnEvent("database.mutated", { async: true })
  async handleDatabaseMutatedEvent(event: DatabaseMutatedEvent): Promise<void> {
    try {
      const db = this.database.getDb();
      await (db as unknown as { insert: (t: unknown) => { values: (v: unknown) => Promise<void> } })
        .insert(auditLogs)
        .values({
          id: crypto.randomUUID(),
          collectionName: event.collectionName,
          documentId: event.documentId,
          action: event.action,
          actorId: event.actorId,
          tenantId: event.tenantId,
          before: event.before,
          after: event.after,
        });
    } catch (error) {
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

import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { DatabaseService } from "../database";
import { TenantContextService } from "../database";
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
    private readonly tenantContext: TenantContextService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "AuditListener" });
  }

  @OnEvent("database.mutated", { async: true })
  async handleDatabaseMutatedEvent(event: DatabaseMutatedEvent): Promise<void> {
    try {
      const result = await this.tenantContext.run(
        { mode: event.tenantId ? "multi" : "single", tenantId: event.tenantId },
        () =>
          this.database.withTransaction(async () => {
            const db = this.database.getTx() ?? this.database.getDb();
            await (
              db as unknown as {
                insert: (table: unknown) => {
                  values: (value: unknown) => Promise<void>;
                };
              }
            )
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
          }),
      );
      if (result.isErr()) throw new Error("AUDIT_WRITE_FAILED");
    } catch (error) {
      this.logger.error(
        {
          error,
          collectionName: event.collectionName,
          documentId: event.documentId,
        },
        "Failed to save audit log",
      );
      throw error;
    }
  }
}

import { Injectable } from "@nestjs/common";
import { eq, and, or, isNull, lte, lt } from "drizzle-orm";
import { DatabaseService, TenantContextService, BaseRepository } from "../database";
import { outboxEvents, type OutboxRow } from "./schemas/outbox.schema";

export interface OutboxEvent {
  id: string;
  tenantId?: string;
  topic: string;
  payload: unknown;
  status: "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED";
  error?: string;
  attempts: number;
  nextAttemptAt?: Date;
  lockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class OutboxRepository extends BaseRepository<OutboxEvent, OutboxRow> {
  constructor(database: DatabaseService, tenantContext: TenantContextService) {
    super(outboxEvents, database, tenantContext, false);
  }

  protected toDomain(row: OutboxRow): OutboxEvent {
    return {
      id: row.id,
      tenantId: row.tenantId ?? undefined,
      topic: row.topic,
      payload: row.payload,
      status: row.status as OutboxEvent["status"],
      error: row.error ?? undefined,
      attempts: row.attempts,
      nextAttemptAt: row.nextAttemptAt ?? undefined,
      lockedAt: row.lockedAt ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async lockPendingEvents(limit: number): Promise<OutboxEvent[]> {
    const db = this.getDb();
    const events: OutboxEvent[] = [];
    for (let i = 0; i < limit; i++) {
      const rows = await (db as unknown as { update: (t: unknown) => { set: (v: unknown) => { where: (c: unknown) => { returning: () => Promise<OutboxRow[]> } } } })
        .update(outboxEvents)
        .set({ status: "PROCESSING", lockedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(outboxEvents.status, "PENDING"),
            or(isNull(outboxEvents.nextAttemptAt), lte(outboxEvents.nextAttemptAt, new Date())),
          ),
        )
        .returning();
      if (!rows[0]) break;
      events.push(this.toDomain(rows[0]));
      if (events.length >= limit) break;
    }
    return events;
  }

  async countPendingEvents(): Promise<number> {
    const result = await this.count({ status: "PENDING" });
    return result.isOk() ? result.value : 0;
  }

  async recoverStaleLocks(lockedBefore: Date): Promise<number> {
    const db = this.getDb();
    const rows = await (db as unknown as { update: (t: unknown) => { set: (v: unknown) => { where: (c: unknown) => { returning: () => Promise<OutboxRow[]> } } } })
      .update(outboxEvents)
      .set({ status: "PENDING", lockedAt: null, updatedAt: new Date() })
      .where(and(eq(outboxEvents.status, "PROCESSING"), lt(outboxEvents.lockedAt, lockedBefore)))
      .returning();
    return rows.length;
  }
}

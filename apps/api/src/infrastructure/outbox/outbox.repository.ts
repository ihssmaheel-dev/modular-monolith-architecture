import { Injectable } from "@nestjs/common";
import { eq, and, lt, sql } from "drizzle-orm";
import { DatabaseService, TenantContextService, BaseRepository } from "../database";
import { outboxEvents, type OutboxRow } from "./schemas/outbox.schema";

export interface OutboxEvent {
  id: string;
  tenantId?: string;
  topic: string;
  payload: unknown;
  status: "PENDING" | "PROCESSING" | "PUBLISHED" | "FAILED" | "DEAD_LETTER";
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
    const result = await (
      db as unknown as { execute: (query: unknown) => Promise<{ rows: unknown[] }> }
    ).execute(sql`WITH locked AS (
        SELECT id FROM outbox_events
        WHERE status = 'PENDING' AND (next_attempt_at IS NULL OR next_attempt_at <= NOW())
        ORDER BY created_at ASC
        LIMIT ${limit}
        FOR UPDATE SKIP LOCKED
      )
      UPDATE outbox_events SET status = 'PROCESSING', locked_at = NOW(), updated_at = NOW()
      WHERE id IN (SELECT id FROM locked)
      RETURNING *`);
    return result.rows.map((row) => this.toDomain(row as OutboxRow));
  }

  async countPendingEvents(): Promise<number> {
    const result = await this.count({ status: "PENDING" });
    return result.isOk() ? result.value : 0;
  }

  async recoverStaleLocks(lockedBefore: Date): Promise<number> {
    const db = this.getDb();
    const rows = await (
      db as unknown as {
        update: (t: unknown) => {
          set: (v: unknown) => { where: (c: unknown) => { returning: () => Promise<OutboxRow[]> } };
        };
      }
    )
      .update(outboxEvents)
      .set({ status: "PENDING", lockedAt: null, updatedAt: new Date() })
      .where(and(eq(outboxEvents.status, "PROCESSING"), lt(outboxEvents.lockedAt, lockedBefore)))
      .returning();
    return rows.length;
  }
}

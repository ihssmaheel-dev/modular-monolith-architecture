import { Inject, Injectable, OnModuleDestroy, Optional } from "@nestjs/common";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { err, ok, type Result } from "neverthrow";
import { ClsService } from "nestjs-cls";
import { PinoLoggerService } from "../logger/logger.service";
import { env } from "../../config/env";
import type { TransactionError } from "./database.types";

import { sql } from "drizzle-orm";

export type Database = NodePgDatabase;
export type DrizzleDb = Database;

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly pool: Pool;
  private readonly db: DrizzleDb;

  private readonly logger: PinoLoggerService;

  constructor(
    @Inject(PinoLoggerService) logger: PinoLoggerService,
    @Optional() @Inject(ClsService) private readonly cls?: ClsService,
  ) {
    this.logger = logger.child({ module: "DatabaseService" });
    this.pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: env.DB_MAX_POOL_SIZE,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    this.pool.on("error", (error) => {
      this.logger.error({ error: String(error) }, "Postgres pool error");
    });

    if (typeof this.pool.query === "function") {
      const originalQuery = this.pool.query.bind(this.pool);
      // @ts-expect-error wrapping pg pool query for slow query observability
      this.pool.query = async (...args: Parameters<typeof originalQuery>) => {
        const start = performance.now();
        try {
          const result = await originalQuery(...args);
          const durationMs = performance.now() - start;
          if (durationMs > 100) {
            const sqlText = typeof args[0] === "string" ? args[0] : (args[0] as { text?: string })?.text ?? "SQL";
            this.logger.warn(
              { sql: sqlText.slice(0, 500), durationMs: Math.round(durationMs) },
              "Slow database query detected (>100ms)",
            );
          }
          return result;
        } catch (err) {
          const durationMs = performance.now() - start;
          const sqlText = typeof args[0] === "string" ? args[0] : (args[0] as { text?: string })?.text ?? "SQL";
          this.logger.error(
            { sql: sqlText.slice(0, 500), durationMs: Math.round(durationMs), error: String(err) },
            "Database query failed",
          );
          throw err;
        }
      };
    }

    this.db = drizzle(this.pool);
    this.logger.info({}, "Postgres pool initialized");
  }

  getDb(): DrizzleDb {
    return this.db;
  }

  getPool(): Pool {
    return this.pool;
  }

  isConnected(): boolean {
    return true;
  }

  async withTransaction<T>(fn: () => Promise<T>): Promise<Result<T, TransactionError>> {
    try {
      const result = await this.db.transaction(async (tx: DrizzleDb) => {
        const current = this.cls?.isActive() ? this.cls.get() : {};
        const tenantId = (current as { tenantId?: string })?.tenantId;
        if (tenantId && typeof (tx as unknown as { execute?: unknown }).execute === "function") {
          await (tx as unknown as { execute: (q: unknown) => Promise<void> }).execute(
            sql`SET LOCAL app.current_tenant = ${tenantId}`,
          );
        }
        if (this.cls) {
          return this.cls.runWith({ ...current, databaseTx: tx } as unknown as Record<string, unknown>, fn);
        }
        return fn();
      });
      return ok(result);
    } catch (error) {
      this.logger.error({ error: String(error) }, "Transaction failed");
      return err({ type: "TRANSACTION_FAILED" });
    }
  }

  async withResultTransaction<T, E>(
    fn: () => Promise<Result<T, E>>,
  ): Promise<Result<T, E | TransactionError>> {
    try {
      const result = await this.db.transaction(async (tx: DrizzleDb) => {
        const current = this.cls?.isActive() ? this.cls.get() : {};
        const tenantId = (current as { tenantId?: string })?.tenantId;
        if (tenantId && typeof (tx as unknown as { execute?: unknown }).execute === "function") {
          await (tx as unknown as { execute: (q: unknown) => Promise<void> }).execute(
            sql`SET LOCAL app.current_tenant = ${tenantId}`,
          );
        }
        const run = async () => {
          const inner = await fn();
          if (inner.isErr()) {
            throw inner.error;
          }
          return inner.value;
        };
        if (this.cls) {
          return this.cls.runWith({ ...current, databaseTx: tx } as unknown as Record<string, unknown>, run);
        }
        return run();
      });
      return ok(result as T);
    } catch (error) {
      if (error && typeof error === "object" && "type" in (error as Record<string, unknown>)) {
        const typed = error as E;
        return err(typed);
      }
      this.logger.error({ error: String(error) }, "Transaction failed");
      return err({ type: "TRANSACTION_FAILED" } as TransactionError);
    }
  }

  getTx(): DrizzleDb | undefined {
    if (this.cls?.isActive()) {
      return this.cls.get("databaseTx" as never) as DrizzleDb | undefined;
    }
    return undefined;
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
    this.logger.info({}, "Postgres pool closed");
  }
}

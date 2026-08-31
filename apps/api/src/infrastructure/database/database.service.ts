import { Inject, Injectable, OnModuleDestroy, Optional } from "@nestjs/common";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import { Pool } from "pg";
import { err, ok, type Result } from "neverthrow";
import { ClsService } from "nestjs-cls";
import { PinoLoggerService } from "../logger/logger.service";
import { env } from "../../config/env";
import type { TransactionError } from "./database.types";

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
            const sqlText =
              typeof args[0] === "string"
                ? args[0]
                : ((args[0] as { text?: string })?.text ?? "SQL");
            this.logger.warn(
              { sql: sqlText.slice(0, 500), durationMs: Math.round(durationMs) },
              "Slow database query detected (>100ms)",
            );
          }
          return result;
        } catch (err) {
          const durationMs = performance.now() - start;
          const sqlText =
            typeof args[0] === "string" ? args[0] : ((args[0] as { text?: string })?.text ?? "SQL");
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
    return !this.pool.ended;
  }

  async withTransaction<T>(fn: () => Promise<T>): Promise<Result<T, TransactionError>> {
    try {
      const result = await this.runTransaction(fn);
      return ok(result);
    } catch (error) {
      this.logger.error({ error: String(error) }, "Transaction failed");
      return err({ type: "TRANSACTION_FAILED" });
    }
  }

  async withResultTransaction<T, E>(
    fn: () => Promise<Result<T, E>>,
  ): Promise<Result<T, E | TransactionError>> {
    if (this.getTx()) {
      try {
        return await fn();
      } catch {
        return err({ type: "TRANSACTION_FAILED" });
      }
    }

    try {
      const result = await this.db.transaction(async (tx: DrizzleDb) => {
        const run = async () => {
          const inner = await fn();
          if (inner.isErr()) {
            throw inner.error;
          }
          return inner.value;
        };
        return this.runWithTransactionContext(tx, run);
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

  /** Runs an HTTP or worker operation in one transaction and preserves thrown failures. */
  async runTransaction<T>(fn: () => Promise<T>): Promise<T> {
    const existing = this.getTx();
    if (existing) return fn();
    return this.db.transaction((tx: DrizzleDb) => this.runWithTransactionContext(tx, fn));
  }

  /** Changes the tenant scope inside the active transaction for invitation/system workflows. */
  async setTenantContext(tenantId: string): Promise<void> {
    const tx = this.getTx();
    if (!tx) throw new Error("TENANT_CONTEXT_REQUIRES_TRANSACTION");
    await this.setConfig(tx, "app.current_tenant", tenantId);
    this.cls?.set("tenantId", tenantId);
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

  private async runWithTransactionContext<T>(tx: DrizzleDb, fn: () => Promise<T>): Promise<T> {
    await this.configureTransactionContext(tx);
    const current = this.cls?.isActive() ? this.cls.get() : {};
    if (!this.cls) return fn();
    return this.cls.runWith(
      { ...current, databaseTx: tx } as unknown as Record<string, unknown>,
      fn,
    );
  }

  private async configureTransactionContext(tx: DrizzleDb): Promise<void> {
    const execute = (tx as unknown as { execute?: (query: unknown) => Promise<unknown> }).execute;
    if (typeof execute !== "function") return;
    const runQuery = execute.bind(tx);
    const current = (this.cls?.isActive() ? this.cls.get() : {}) as Record<string, unknown>;
    const mode = typeof current.tenantMode === "string" ? current.tenantMode : env.TENANCY_MODE;
    const tenantId = typeof current.tenantId === "string" ? current.tenantId : "";
    const userId = typeof current.userId === "string" ? current.userId : "";
    const userEmail = typeof current.userEmail === "string" ? current.userEmail : "";
    const systemScope = current.systemScope === true ? "true" : "false";
    await runQuery(sql`select set_config('app.tenancy_mode', ${mode}, true)`);
    await runQuery(sql`select set_config('app.current_tenant', ${tenantId}, true)`);
    await runQuery(sql`select set_config('app.current_user', ${userId}, true)`);
    await runQuery(sql`select set_config('app.current_user_email', ${userEmail}, true)`);
    await runQuery(sql`select set_config('app.system_scope', ${systemScope}, true)`);
  }

  private async setConfig(tx: DrizzleDb, key: string, value: string): Promise<void> {
    const execute = (tx as unknown as { execute?: (query: unknown) => Promise<unknown> }).execute;
    if (typeof execute !== "function") return;
    await execute.call(tx, sql`select set_config(${key}, ${value}, true)`);
  }
}

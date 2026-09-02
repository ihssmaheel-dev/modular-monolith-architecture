import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { sql } from "drizzle-orm";
import { env } from "../../config/env";
import { DatabaseService } from "../database";
import { PinoLoggerService } from "../logger/logger.service";

@Injectable()
export class AuditRetentionWorker {
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly database: DatabaseService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "AuditRetentionWorker" });
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async purgeExpiredLogs(): Promise<number> {
    if (env.PROCESS_ROLE === "api") return 0;
    try {
      const result = await this.database.withSystemScope(() =>
        this.database.runTransaction(async () => {
          const db = this.database.getTx() ?? this.database.getDb();
          return (
            db as unknown as {
              execute: (query: unknown) => Promise<{ rows: Array<{ purged: number | string }> }>;
            }
          ).execute(
            sql`SELECT public.purge_audit_logs_older_than(${env.AUDIT_RETENTION_DAYS}) AS purged`,
          );
        }),
      );
      const purged = Number(result.rows[0]?.purged ?? 0);
      if (purged > 0) this.logger.info({ purged }, "Expired audit logs purged");
      return purged;
    } catch (error) {
      this.logger.error({ error }, "Audit retention run failed");
      return 0;
    }
  }
}

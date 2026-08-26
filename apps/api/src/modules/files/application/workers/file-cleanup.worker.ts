import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { FilesRepository } from "../../infrastructure/files.repository";
import { StorageService } from "../../../../infrastructure/storage/storage.service";
import { PinoLoggerService } from "../../../../infrastructure/logger/logger.service";
import { MetricsService } from "../../../../infrastructure/metrics/metrics.service";

import { TenantContextService } from "../../../../infrastructure/database";

const PENDING_EXPIRATION_HOURS = 24;

@Injectable()
export class FileCleanupWorker {
  private isRunning = false;
  private readonly logger: PinoLoggerService;

  constructor(
    private readonly filesRepository: FilesRepository,
    private readonly storageService: StorageService,
    private readonly metrics: MetricsService,
    private readonly tenantContext: TenantContextService,
    logger: PinoLoggerService,
  ) {
    this.logger = logger.child({ module: "FileCleanupWorker" });
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async cleanupOrphanPendingFiles(): Promise<{ purgedCount: number; reclaimedBytes: number }> {
    if (this.isRunning) {
      this.logger.warn({}, "File cleanup already in progress, skipping run");
      return { purgedCount: 0, reclaimedBytes: 0 };
    }

    this.isRunning = true;
    let purgedCount = 0;
    let reclaimedBytes = 0;

    try {
      const cutoff = new Date(Date.now() - PENDING_EXPIRATION_HOURS * 60 * 60 * 1000);
      const staleFiles = await this.filesRepository.findPendingFilesBefore(cutoff);

      for (const file of staleFiles) {
        try {
          await this.storageService.delete(file.key);
          await this.tenantContext.run(
            { mode: file.tenantId ? "multi" : "single", tenantId: file.tenantId },
            async () => {
              await this.filesRepository.deleteById(file.id);
            },
          );
          purgedCount += 1;
          reclaimedBytes += file.fileSize;
        } catch (error) {
          this.logger.error({ fileId: file.id, key: file.key, error }, "Failed to purge orphan file");
        }
      }

      if (purgedCount > 0) {
        this.metrics.incrementCounter(
          "file_cleanup_purged_total",
          "Total orphan files purged",
          purgedCount,
        );
        this.logger.info({ purgedCount, reclaimedBytes }, "Completed orphan file cleanup run");
      }
    } catch (error) {
      this.logger.error({ error }, "Error during orphan file cleanup execution");
    } finally {
      this.isRunning = false;
    }

    return { purgedCount, reclaimedBytes };
  }
}

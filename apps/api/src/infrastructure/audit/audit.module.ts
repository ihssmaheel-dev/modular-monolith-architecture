import { Module } from "@nestjs/common";
import { AuditListener } from "./audit.listener";
import { AuditRetentionWorker } from "./audit-retention.worker";

@Module({
  providers: [AuditListener, AuditRetentionWorker],
})
export class AuditModule {}

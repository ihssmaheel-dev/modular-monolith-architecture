import { Module } from "@nestjs/common";
import { AuditListener } from "./audit.listener";

@Module({
  providers: [AuditListener],
})
export class AuditModule {}

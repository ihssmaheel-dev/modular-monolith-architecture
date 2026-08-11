import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuditLogMongooseSchema, AuditLogSchema } from "./schemas/audit-log.mongoose.schema";
import { AuditListener } from "./audit.listener";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AuditLogMongooseSchema.name, schema: AuditLogSchema }]),
  ],
  providers: [AuditListener],
})
export class AuditModule {}

import { Module, Global } from "@nestjs/common";
import { DatabaseService } from "./database.service";
import { TenantContextService } from "./tenant-context.service";

@Global()
@Module({
  providers: [DatabaseService, TenantContextService],
  exports: [DatabaseService, TenantContextService],
})
export class DatabaseModule {}

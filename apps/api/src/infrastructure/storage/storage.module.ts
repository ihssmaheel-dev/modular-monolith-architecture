import { Module, Global } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { StorageService } from "./storage.service";

@Global()
@Module({
  imports: [MongooseModule],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}

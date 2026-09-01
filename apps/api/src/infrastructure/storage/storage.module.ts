import { Global, Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { FileScannerService } from "./file-scanner.service";

@Global()
@Module({
  providers: [StorageService, FileScannerService],
  exports: [StorageService, FileScannerService],
})
export class StorageModule {}

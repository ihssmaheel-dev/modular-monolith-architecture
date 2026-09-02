import { Module, type OnModuleInit } from "@nestjs/common";
import { AuthorizationService } from "../../infrastructure/authorization";
import { filePolicies } from "./application/files.policies";
import { FilesController } from "./presentation/files.controller";
import { RequestUploadCommand } from "./application/commands/request-upload.command";
import { ConfirmUploadCommand } from "./application/commands/confirm-upload.command";
import { DeleteFileCommand } from "./application/commands/delete-file.command";
import { GetFileByIdQuery } from "./application/queries/get-file-by-id.query";
import { GetFileDownloadUrlQuery } from "./application/queries/get-file-download-url.query";
import { ListFilesByParentQuery } from "./application/queries/list-files-by-parent.query";
import { FileCleanupWorker } from "./application/workers/file-cleanup.worker";
import { FileScanWorker } from "./application/workers/file-scan.worker";
import { FileReconciliationWorker } from "./application/workers/file-reconciliation.worker";
import { FilesRepository } from "./infrastructure/files.repository";
import { DatabaseModule } from "../../infrastructure/database";
import { FilesOrpcController } from "./presentation/files.orpc.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [FilesController, FilesOrpcController],
  providers: [
    FilesController,
    RequestUploadCommand,
    ConfirmUploadCommand,
    DeleteFileCommand,
    GetFileByIdQuery,
    GetFileDownloadUrlQuery,
    ListFilesByParentQuery,
    FileCleanupWorker,
    FileScanWorker,
    FileReconciliationWorker,
    FilesRepository,
  ],
  exports: [
    RequestUploadCommand,
    ConfirmUploadCommand,
    DeleteFileCommand,
    GetFileByIdQuery,
    GetFileDownloadUrlQuery,
    ListFilesByParentQuery,
    FileCleanupWorker,
    FileScanWorker,
    FileReconciliationWorker,
    FilesRepository,
  ],
})
export class FilesModule implements OnModuleInit {
  constructor(private readonly authService: AuthorizationService) {}

  onModuleInit(): void {
    this.authService.registerPolicies(filePolicies);
  }
}

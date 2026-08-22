import { Module } from "@nestjs/common";
import { FilesController } from "./presentation/files.controller";
import { RequestUploadCommand } from "./application/commands/request-upload.command";
import { ConfirmUploadCommand } from "./application/commands/confirm-upload.command";
import { DeleteFileCommand } from "./application/commands/delete-file.command";
import { GetFileByIdQuery } from "./application/queries/get-file-by-id.query";
import { GetFileDownloadUrlQuery } from "./application/queries/get-file-download-url.query";
import { ListFilesByParentQuery } from "./application/queries/list-files-by-parent.query";
import { FilesRepository } from "./infrastructure/files.repository";

@Module({
  controllers: [FilesController],
  providers: [
    RequestUploadCommand,
    ConfirmUploadCommand,
    DeleteFileCommand,
    GetFileByIdQuery,
    GetFileDownloadUrlQuery,
    ListFilesByParentQuery,
    FilesRepository,
  ],
  exports: [
    RequestUploadCommand,
    ConfirmUploadCommand,
    DeleteFileCommand,
    GetFileByIdQuery,
    GetFileDownloadUrlQuery,
    ListFilesByParentQuery,
    FilesRepository,
  ],
})
export class FilesModule {}

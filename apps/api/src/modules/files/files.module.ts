import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FilesController } from "./presentation/files.controller";
import { FilesTransferController } from "./presentation/files-transfer.controller";
import { UploadGridFsFileCommand } from "./application/commands/upload-gridfs-file.command";
import { GetGridFsFileContentQuery } from "./application/queries/get-gridfs-file-content.query";
import { RequestUploadCommand } from "./application/commands/request-upload.command";
import { ConfirmUploadCommand } from "./application/commands/confirm-upload.command";
import { DeleteFileCommand } from "./application/commands/delete-file.command";
import { GetFileByIdQuery } from "./application/queries/get-file-by-id.query";
import { GetFileDownloadUrlQuery } from "./application/queries/get-file-download-url.query";
import { ListFilesByParentQuery } from "./application/queries/list-files-by-parent.query";
import { FilesRepository } from "./infrastructure/files.repository";
import { FileMongooseSchema, FileSchema } from "./infrastructure/schemas/file.mongoose.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: FileMongooseSchema.name, schema: FileSchema }])],
  controllers: [FilesController, FilesTransferController],
  providers: [
    RequestUploadCommand,
    ConfirmUploadCommand,
    DeleteFileCommand,
    GetFileByIdQuery,
    GetFileDownloadUrlQuery,
    ListFilesByParentQuery,
    UploadGridFsFileCommand,
    GetGridFsFileContentQuery,
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

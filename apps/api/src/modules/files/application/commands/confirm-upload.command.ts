import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { FilesRepository } from "../../infrastructure/files.repository";
import { FileEntity } from "../../domain/entities/file.entity";
import type { FileError } from "../../domain/errors/file.errors";
import type { AuthenticatedUser } from "@repo/shared";
import { StorageService } from "../../../../infrastructure/storage/storage.service";

@Injectable()
export class ConfirmUploadCommand {
  constructor(
    private readonly filesRepo: FilesRepository,
    private readonly storage: StorageService,
  ) {}

  async execute(fileKey: string, actor: AuthenticatedUser): Promise<Result<FileEntity, FileError>> {
    const file = await this.filesRepo.findByKey(fileKey);

    if (!file || (actor.role !== "admin" && file.uploadedBy !== actor.sub)) {
      return err({
        type: "FILE_NOT_FOUND",
        message: "api.note.notFound",
      });
    }

    const metadata = await this.storage.getMetadata(file.key);
    if (metadata.isErr() || !this.matches(file, metadata.value)) {
      return err({ type: "UPLOAD_FAILED", message: "api.error.uploadFailed" });
    }

    const updateResult = await this.filesRepo.updateById(file.id, {
      status: "uploaded",
    });

    if (updateResult.isErr() || !updateResult.value) {
      return err({
        type: "UPLOAD_FAILED",
        message: "api.error.uploadFailed",
      });
    }

    return ok(updateResult.value);
  }

  private matches(file: FileEntity, metadata: { size: number; contentType?: string } | null) {
    return (
      metadata !== null &&
      metadata.size === file.fileSize &&
      metadata.contentType === file.contentType
    );
  }
}

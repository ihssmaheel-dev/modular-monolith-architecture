import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { FilesRepository } from "../../infrastructure/files.repository";
import { FileEntity } from "../../domain/entities/file.entity";
import type { FileError } from "../../domain/errors/file.errors";

@Injectable()
export class ConfirmUploadCommand {
  constructor(private readonly filesRepo: FilesRepository) {}

  async execute(fileKey: string): Promise<Result<FileEntity, FileError>> {
    const file = await this.filesRepo.findByKey(fileKey);

    if (!file) {
      return err({
        type: "FILE_NOT_FOUND",
        message: "api.note.notFound",
      });
    }

    const updateResult = await this.filesRepo.updateById(file.id, {
      status: "uploaded",
    });

    if (updateResult.isErr()) {
      return err({
        type: "UPLOAD_FAILED",
        message: "api.error.uploadFailed",
      });
    }

    return ok(updateResult.value!);
  }
}

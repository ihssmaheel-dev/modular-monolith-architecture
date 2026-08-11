import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { StorageService } from "../../../../infrastructure/storage/storage.service";
import { FilesRepository } from "../../infrastructure/files.repository";
import type { FileError } from "../../domain/errors/file.errors";
import type { AuthenticatedUser } from "@repo/shared";

@Injectable()
export class DeleteFileCommand {
  constructor(
    private readonly storage: StorageService,
    private readonly filesRepo: FilesRepository,
  ) {}

  async execute(fileId: string, actor: AuthenticatedUser): Promise<Result<void, FileError>> {
    const findResult = await this.filesRepo.findById(fileId);

    if (findResult.isErr() || !findResult.value) {
      return err({
        type: "FILE_NOT_FOUND",
        message: "api.note.notFound",
      });
    }

    const file = findResult.value;

    if (actor.role !== "admin" && file.uploadedBy !== actor.sub) {
      return err({
        type: "UNAUTHORIZED",
        message: "api.error.unauthorized",
      });
    }

    const deleteResult = await this.filesRepo.softDeleteById(fileId);

    if (deleteResult.isErr()) {
      return err({
        type: "DELETE_FAILED",
        message: "api.error.deleteFailed",
      });
    }

    await this.storage.delete(file.key);

    return ok(undefined);
  }
}

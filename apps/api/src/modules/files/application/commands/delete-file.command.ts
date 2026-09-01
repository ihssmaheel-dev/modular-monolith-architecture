import { Injectable, Optional } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { StorageService } from "../../../../infrastructure/storage/storage.service";
import { FilesRepository } from "../../infrastructure/files.repository";
import type { FileError } from "../../domain/errors/file.errors";
import type { AuthenticatedUser } from "@repo/contracts";
import { DatabaseService } from "../../../../infrastructure/database";
import { resolveResourceOwnerId } from "@repo/authorization";

@Injectable()
export class DeleteFileCommand {
  constructor(
    private readonly storage: StorageService,
    private readonly filesRepo: FilesRepository,
    @Optional() private readonly database?: DatabaseService,
  ) {}

  async execute(fileId: string, actor: AuthenticatedUser): Promise<Result<void, FileError>> {
    const findResult = this.database
      ? await this.database.runTransaction(() => this.filesRepo.findById(fileId))
      : await this.filesRepo.findById(fileId);

    if (findResult.isErr() || !findResult.value) {
      return err({
        type: "FILE_NOT_FOUND",
        message: "api.note.notFound",
      });
    }

    const file = findResult.value;

    if (
      actor.role !== "admin" &&
      resolveResourceOwnerId("file", file as unknown as Record<string, unknown>) !== actor.sub
    ) {
      return err({
        type: "UNAUTHORIZED",
        message: "api.error.unauthorized",
      });
    }

    const markDeleted = () => this.filesRepo.softDeleteById(fileId);
    const deleteResult = this.database
      ? await this.database.withResultTransaction(markDeleted)
      : await markDeleted();
    if (deleteResult.isErr() || !deleteResult.value) {
      return err({
        type: "DELETE_FAILED",
        message: "api.error.deleteFailed",
      });
    }

    const storageResult = await this.storage.delete(file.key);
    if (storageResult.isErr()) {
      return err({ type: "DELETE_FAILED", message: "api.error.deleteFailed" });
    }

    return ok(undefined);
  }
}

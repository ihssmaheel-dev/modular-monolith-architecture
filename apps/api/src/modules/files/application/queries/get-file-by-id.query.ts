import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { FilesRepository } from "../../infrastructure/files.repository";
import { FileEntity } from "../../domain/entities/file.entity";
import type { FileError } from "../../domain/errors/file.errors";
import type { AuthenticatedUser } from "@repo/contracts";

@Injectable()
export class GetFileByIdQuery {
  constructor(private readonly filesRepo: FilesRepository) {}

  async execute(fileId: string, actor: AuthenticatedUser): Promise<Result<FileEntity, FileError>> {
    const findResult = await this.filesRepo.findById(fileId);

    if (findResult.isErr() || !findResult.value) {
      return err({
        type: "FILE_NOT_FOUND",
        message: "api.note.notFound",
      });
    }

    if (actor.role !== "admin" && findResult.value.uploadedBy !== actor.sub) {
      return err({
        type: "FILE_NOT_FOUND",
        message: "api.file.notFound",
      });
    }

    return ok(findResult.value);
  }
}

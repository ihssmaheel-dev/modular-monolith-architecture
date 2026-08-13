import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { StorageService } from "../../../../infrastructure/storage/storage.service";
import { env } from "../../../../config/env";
import { FilesRepository } from "../../infrastructure/files.repository";
import type { FileError } from "../../domain/errors/file.errors";
import type { AuthenticatedUser } from "@repo/shared";

interface DownloadUrlResult {
  downloadUrl: string;
}

@Injectable()
export class GetFileDownloadUrlQuery {
  constructor(
    private readonly storage: StorageService,
    private readonly filesRepo: FilesRepository,
  ) {}

  async execute(
    fileId: string,
    actor: AuthenticatedUser,
  ): Promise<Result<DownloadUrlResult, FileError>> {
    const findResult = await this.filesRepo.findById(fileId);

    if (findResult.isErr() || !findResult.value) {
      return err({
        type: "FILE_NOT_FOUND",
        message: "api.note.notFound",
      });
    }

    const file = findResult.value;
    if (actor.role !== "admin" && file.uploadedBy !== actor.sub) {
      return err({ type: "FILE_NOT_FOUND", message: "api.file.notFound" });
    }
    if (file.status !== "uploaded") {
      return err({ type: "FILE_NOT_FOUND", message: "api.file.notFound" });
    }
    if (!this.storage.usesDirectTransfer()) {
      return ok({ downloadUrl: new URL(`/api/files/${file.id}/content`, env.API_URL).toString() });
    }
    const urlResult = await this.storage.getPresignedDownloadUrl(file.key);

    if (urlResult.isErr()) {
      return err({
        type: "PRESIGN_FAILED",
        message: "api.error.presignFailed",
      });
    }

    return ok({ downloadUrl: urlResult.value });
  }
}

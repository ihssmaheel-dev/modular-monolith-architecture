import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { StorageService } from "../../../../infrastructure/storage/storage.service";
import { FilesRepository } from "../../infrastructure/files.repository";
import type { FileError } from "../../domain/errors/file.errors";

interface DownloadUrlResult {
  downloadUrl: string;
}

@Injectable()
export class GetFileDownloadUrlQuery {
  constructor(
    private readonly storage: StorageService,
    private readonly filesRepo: FilesRepository,
  ) {}

  async execute(fileId: string): Promise<Result<DownloadUrlResult, FileError>> {
    const findResult = await this.filesRepo.findById(fileId);

    if (findResult.isErr() || !findResult.value) {
      return err({
        type: "FILE_NOT_FOUND",
        message: "api.note.notFound",
      });
    }

    const file = findResult.value;
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

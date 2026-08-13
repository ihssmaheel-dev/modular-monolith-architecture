import { Injectable } from "@nestjs/common";
import { err, ok, Result } from "neverthrow";
import { Readable } from "node:stream";
import type { AuthenticatedUser } from "@repo/shared";
import { StorageService } from "../../../../infrastructure/storage/storage.service";
import { FileEntity } from "../../domain/entities/file.entity";
import type { FileError } from "../../domain/errors/file.errors";
import { FilesRepository } from "../../infrastructure/files.repository";

export interface GridFsContent {
  file: FileEntity;
  stream: Readable;
}

@Injectable()
export class GetGridFsFileContentQuery {
  constructor(
    private readonly storage: StorageService,
    private readonly filesRepo: FilesRepository,
  ) {}

  async execute(
    fileId: string,
    actor: AuthenticatedUser,
  ): Promise<Result<GridFsContent, FileError>> {
    if (this.storage.usesDirectTransfer()) return err(this.unavailable());
    const found = await this.filesRepo.findById(fileId);
    const file = found.isOk() ? found.value : null;
    if (!this.canRead(file, actor)) return err(this.notFound());
    const download = await this.storage.getDownloadStream(file.key);
    if (download.isErr()) return err(this.notFound());
    return ok({ file, stream: download.value });
  }

  private canRead(file: FileEntity | null, actor: AuthenticatedUser): file is FileEntity {
    return Boolean(
      file &&
      file.status === "uploaded" &&
      (actor.role === "admin" || file.uploadedBy === actor.sub),
    );
  }

  private notFound(): FileError {
    return { type: "FILE_NOT_FOUND", message: "api.file.notFound" };
  }
  private unavailable(): FileError {
    return { type: "PROXY_TRANSFER_UNAVAILABLE", message: "api.file.notFound" };
  }
}

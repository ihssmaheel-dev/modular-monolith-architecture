import { Injectable } from "@nestjs/common";
import { err, ok, Result } from "neverthrow";
import { Readable, Transform, TransformCallback } from "node:stream";
import type { AuthenticatedUser } from "@repo/shared";
import { StorageService } from "../../../../infrastructure/storage/storage.service";
import { FileEntity } from "../../domain/entities/file.entity";
import type { FileError } from "../../domain/errors/file.errors";
import { FilesRepository } from "../../infrastructure/files.repository";

@Injectable()
export class UploadGridFsFileCommand {
  constructor(
    private readonly storage: StorageService,
    private readonly filesRepo: FilesRepository,
  ) {}

  async execute(
    key: string,
    body: Readable,
    actor: AuthenticatedUser,
  ): Promise<Result<FileEntity, FileError>> {
    if (this.storage.usesDirectTransfer()) return err(this.proxyUnavailable());
    const file = await this.filesRepo.findByKey(key);
    if (!this.canUpload(file, actor)) return err(this.notFound());
    if (file.status === "uploaded") return ok(file);
    if (file.status === "uploading") return err(this.inProgress());
    return this.uploadClaimed(file, body);
  }

  private async uploadClaimed(
    file: FileEntity,
    body: Readable,
  ): Promise<Result<FileEntity, FileError>> {
    const claim = await this.filesRepo.claimPendingUpload(file.key);
    if (claim.isErr()) return err(this.uploadFailed());
    if (!claim.value) return err(this.inProgress());
    const limiter = new FileSizeLimiter(file.fileSize);
    const upload = await this.storage.upload(file.key, body.pipe(limiter), file.contentType);
    if (upload.isErr()) return this.release(file.id, limiter.exceeded);
    const metadata = await this.storage.getMetadata(file.key);
    if (metadata.isErr() || !this.matches(file, metadata.value)) return this.release(file.id);
    const saved = await this.filesRepo.updateById(file.id, { status: "uploaded" });
    return saved.isOk() && saved.value ? ok(saved.value) : this.release(file.id);
  }

  private async release(fileId: string, tooLarge = false): Promise<Result<FileEntity, FileError>> {
    await this.filesRepo.updateById(fileId, { status: "pending" });
    return err(tooLarge ? this.tooLarge() : this.uploadFailed());
  }

  private canUpload(file: FileEntity | null, actor: AuthenticatedUser): file is FileEntity {
    return Boolean(file && (actor.role === "admin" || file.uploadedBy === actor.sub));
  }

  private matches(
    file: FileEntity,
    metadata: { size: number; contentType?: string } | null,
  ): boolean {
    return metadata?.size === file.fileSize && metadata.contentType === file.contentType;
  }

  private notFound(): FileError {
    return { type: "FILE_NOT_FOUND", message: "api.file.notFound" };
  }
  private inProgress(): FileError {
    return { type: "UPLOAD_IN_PROGRESS", message: "api.error.conflict" };
  }
  private uploadFailed(): FileError {
    return { type: "UPLOAD_FAILED", message: "api.error.uploadFailed" };
  }
  private tooLarge(): FileError {
    return { type: "FILE_TOO_LARGE", message: "api.error.fileTooLarge" };
  }
  private proxyUnavailable(): FileError {
    return { type: "PROXY_TRANSFER_UNAVAILABLE", message: "api.file.notFound" };
  }
}

class FileSizeLimiter extends Transform {
  exceeded = false;
  private receivedBytes = 0;

  constructor(private readonly maxBytes: number) {
    super();
  }

  _transform(chunk: Buffer, _encoding: BufferEncoding, done: TransformCallback): void {
    this.receivedBytes += chunk.length;
    this.exceeded = this.receivedBytes > this.maxBytes;
    done(this.exceeded ? new Error("File size limit exceeded") : null, chunk);
  }
}

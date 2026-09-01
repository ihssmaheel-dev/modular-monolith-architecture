import { Injectable, Optional } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { randomUUID } from "crypto";
import { env } from "../../../../config/env";
import { StorageService } from "../../../../infrastructure/storage/storage.service";
import { FilesRepository } from "../../infrastructure/files.repository";
import type { FileError } from "../../domain/errors/file.errors";
import type { RequestUploadInput } from "@repo/contracts";
import { TenantContextService } from "../../../../infrastructure/database";
import { env as runtimeEnv } from "../../../../config/env";
import { DatabaseService } from "../../../../infrastructure/database";
import { PinoLoggerService } from "../../../../infrastructure/logger/logger.service";

const PRESIGNED_UPLOAD_TTL_SECONDS = 3_600;

interface RequestUploadResult {
  uploadMode: "direct" | "proxy";
  uploadUrl: string;
  fileKey: string;
  expiresAt?: string;
}

@Injectable()
export class RequestUploadCommand {
  constructor(
    private readonly storage: StorageService,
    private readonly filesRepo: FilesRepository,
    private readonly tenantContext: TenantContextService,
    @Optional() private readonly database?: DatabaseService,
    @Optional() logger?: PinoLoggerService,
  ) {
    this.logger = logger?.child({ module: "RequestUploadCommand" });
  }

  private readonly logger?: PinoLoggerService;

  async execute(
    input: RequestUploadInput,
    userId: string,
  ): Promise<Result<RequestUploadResult, FileError>> {
    const quota = await this.checkQuota(input.fileSize, userId);
    if (!quota) {
      return err({ type: "UPLOAD_FAILED", message: "api.error.uploadFailed" });
    }
    const fileKey = this.buildKey(input, userId);

    const transfer = await this.createTransfer(fileKey, input.contentType);

    if (transfer.isErr()) {
      return err({
        type: "PRESIGN_FAILED",
        message: "api.error.presignFailed",
      });
    }

    const createResult = await this.createFileRecord(fileKey, input, userId);

    if (createResult.isErr()) {
      if (
        typeof (
          this.storage as unknown as { delete?: (key: string) => Promise<{ isErr: () => boolean }> }
        ).delete === "function"
      ) {
        const cleanup = await this.storage.delete(fileKey);
        if (cleanup.isErr()) this.logger?.warn({ key: fileKey }, "Orphan upload cleanup deferred");
      }
      return err({
        type: "UPLOAD_FAILED",
        message: "api.error.uploadFailed",
      });
    }

    return ok({ ...transfer.value, fileKey });
  }

  private async createFileRecord(fileKey: string, input: RequestUploadInput, userId: string) {
    const create = () =>
      this.filesRepo.create({
        key: fileKey,
        fileName: input.fileName,
        contentType: input.contentType,
        fileSize: input.fileSize,
        bucket: env.S3_BUCKET,
        parentId: input.parentId,
        parentType: input.parentType,
        uploadedBy: userId,
        status: "pending",
      });
    return this.database ? this.database.withResultTransaction(create) : create();
  }

  private async checkQuota(fileSize: number, userId: string): Promise<boolean> {
    const repository = this.filesRepo as unknown as {
      sumActiveBytes?: (uploadedBy: string) => Promise<number>;
    };
    if (!repository.sumActiveBytes) return true;
    const current = this.database
      ? await this.database.runTransaction(() => repository.sumActiveBytes!(userId))
      : await repository.sumActiveBytes(userId);
    return current + fileSize <= runtimeEnv.FILE_USER_QUOTA_BYTES;
  }

  private async createTransfer(fileKey: string, contentType: string) {
    const result = await this.storage.getPresignedUploadUrl(fileKey, contentType);
    if (result.isErr()) return err(result.error);
    const expiresAt = new Date(Date.now() + PRESIGNED_UPLOAD_TTL_SECONDS * 1_000);
    return ok({
      uploadMode: "direct" as const,
      uploadUrl: result.value,
      expiresAt: expiresAt.toISOString(),
    });
  }

  private buildKey(input: RequestUploadInput, userId: string): string {
    const uuid = randomUUID();
    const sanitized = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const prefix =
      input.parentType !== "general" && input.parentId
        ? `${input.parentType}/${input.parentId}`
        : "general";
    const tenantId = this.tenantContext.get().tenantId;
    const tenantPrefix = tenantId ? `tenants/${tenantId}/` : "";
    return `${tenantPrefix}${prefix}/${userId}/${uuid}-${sanitized}`;
  }
}

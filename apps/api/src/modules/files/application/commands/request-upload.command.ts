import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { randomUUID } from "crypto";
import { env } from "../../../../config/env";
import { StorageService } from "../../../../infrastructure/storage/storage.service";
import { FilesRepository } from "../../infrastructure/files.repository";
import type { FileError } from "../../domain/errors/file.errors";
import type { RequestUploadInput } from "@repo/shared";
import { TenantContextService } from "../../../../infrastructure/database";

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
  ) {}

  async execute(
    input: RequestUploadInput,
    userId: string,
  ): Promise<Result<RequestUploadResult, FileError>> {
    const fileKey = this.buildKey(input, userId);

    const transfer = await this.createTransfer(fileKey, input.contentType);

    if (transfer.isErr()) {
      return err({
        type: "PRESIGN_FAILED",
        message: "api.error.presignFailed",
      });
    }

    const createResult = await this.filesRepo.create({
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

    if (createResult.isErr()) {
      return err({
        type: "UPLOAD_FAILED",
        message: "api.error.uploadFailed",
      });
    }

    return ok({ ...transfer.value, fileKey });
  }

  private async createTransfer(fileKey: string, contentType: string) {
    if (!this.storage.usesDirectTransfer()) {
      return ok({ uploadMode: "proxy" as const, uploadUrl: this.proxyUploadUrl(fileKey) });
    }
    const result = await this.storage.getPresignedUploadUrl(fileKey, contentType);
    if (result.isErr()) return err(result.error);
    const expiresAt = new Date(Date.now() + PRESIGNED_UPLOAD_TTL_SECONDS * 1_000);
    return ok({
      uploadMode: "direct" as const,
      uploadUrl: result.value,
      expiresAt: expiresAt.toISOString(),
    });
  }

  private proxyUploadUrl(fileKey: string): string {
    const url = new URL("/api/files/gridfs/upload", env.API_URL);
    url.searchParams.set("fileKey", fileKey);
    return url.toString();
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

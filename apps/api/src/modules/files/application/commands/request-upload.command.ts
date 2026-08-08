import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { randomUUID } from "crypto";
import { env } from "../../../../config/env";
import { StorageService } from "../../../../infrastructure/storage/storage.service";
import { FilesRepository } from "../../infrastructure/files.repository";
import type { FileError } from "../../domain/errors/file.errors";
import type { RequestUploadInput } from "@repo/shared";

interface RequestUploadResult {
  uploadUrl: string;
  fileKey: string;
  expiresAt: Date;
}

@Injectable()
export class RequestUploadCommand {
  constructor(
    private readonly storage: StorageService,
    private readonly filesRepo: FilesRepository,
  ) {}

  async execute(
    input: RequestUploadInput,
    userId: string,
  ): Promise<Result<RequestUploadResult, FileError>> {
    const fileKey = this.buildKey(input, userId);

    const presignResult = await this.storage.getPresignedUploadUrl(
      fileKey,
      input.contentType,
    );

    if (presignResult.isErr()) {
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

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + 3600);

    return ok({
      uploadUrl: presignResult.value,
      fileKey,
      expiresAt,
    });
  }

  private buildKey(input: RequestUploadInput, userId: string): string {
    const uuid = randomUUID();
    const sanitized = input.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const prefix = input.parentType !== "general" && input.parentId
      ? `${input.parentType}/${input.parentId}`
      : "general";
    return `${prefix}/${userId}/${uuid}-${sanitized}`;
  }
}

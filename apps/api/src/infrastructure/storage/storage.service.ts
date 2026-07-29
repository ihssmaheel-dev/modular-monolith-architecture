import { Injectable } from "@nestjs/common";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  GetObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Result } from "neverthrow";
import { env } from "../../config/env";
import { PinoLoggerService } from "../logger/logger.service";
import { StorageError, UploadResult, PRESIGN_TTL_SECONDS } from "./storage.types";

@Injectable()
export class StorageService {
  private client: S3Client;

  constructor(private logger: PinoLoggerService) {
    this.logger = logger.child({ module: "StorageService" });
    this.client = new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
    });
  }

  async upload(key: string, body: Buffer | ReadableStream, contentType: string): Promise<Result<UploadResult, StorageError>> {
    try {
      await this.client.send(new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Body: body, ContentType: contentType }));
      this.logger.info({ key, contentType }, "File uploaded");
      return Result.ok({ key, url: `/${env.S3_BUCKET}/${key}` });
    } catch (error: any) {
      this.logger.error({ key, error }, "Upload failed");
      return Result.err({ code: "UPLOAD_FAILED", message: error.message || "Upload failed" });
    }
  }

  async getPresignedUploadUrl(key: string, contentType: string, ttlSeconds = PRESIGN_TTL_SECONDS): Promise<Result<string, StorageError>> {
    try {
      const command = new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, ContentType: contentType });
      return Result.ok(await getSignedUrl(this.client, command, { expiresIn: ttlSeconds }));
    } catch (error: any) {
      this.logger.error({ key, error }, "Presign upload failed");
      return Result.err({ code: "PRESIGN_FAILED", message: error.message || "Presign failed" });
    }
  }

  async getPresignedDownloadUrl(key: string, ttlSeconds = PRESIGN_TTL_SECONDS): Promise<Result<string, StorageError>> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
      const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key });
      return Result.ok(await getSignedUrl(this.client, command, { expiresIn: ttlSeconds }));
    } catch (error: any) {
      this.logger.error({ key, error }, "Presign download failed");
      return Result.err({ code: "NOT_FOUND", message: error.message || "File not found" });
    }
  }

  async delete(key: string): Promise<Result<void, StorageError>> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
      this.logger.info({ key }, "File deleted");
      return Result.ok(undefined);
    } catch (error: any) {
      this.logger.error({ key, error }, "Delete failed");
      return Result.err({ code: "DELETE_FAILED", message: error.message || "Delete failed" });
    }
  }
}

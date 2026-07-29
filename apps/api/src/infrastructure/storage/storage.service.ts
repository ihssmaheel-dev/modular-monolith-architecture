import { Injectable } from "@nestjs/common";
import { Result } from "neverthrow";
import { env } from "../../config/env";
import { PinoLoggerService } from "../logger/logger.service";
import { StorageDriver, StorageError, UploadResult, FileInput, PRESIGN_TTL_SECONDS } from "./storage.types";
import { S3Driver } from "./drivers/s3.driver";
import { GridFsDriver } from "./drivers/gridfs.driver";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";

@Injectable()
export class StorageService {
  private driver: StorageDriver;

  constructor(
    private logger: PinoLoggerService,
    @InjectConnection() connection: Connection,
  ) {
    this.logger = logger.child({ module: "StorageService" });
    this.driver = this.createDriver(connection);
  }

  private createDriver(connection: Connection): StorageDriver {
    switch (env.STORAGE_DRIVER) {
      case "s3":
        this.logger.info({}, "Storage: Using S3 driver");
        return new S3Driver();
      case "gridfs":
      default:
        this.logger.info({}, "Storage: Using GridFS driver");
        return new GridFsDriver(connection);
    }
  }

  async upload(key: string, body: FileInput, contentType: string): Promise<Result<UploadResult, StorageError>> {
    try {
      const result = await this.driver.upload(key, body, contentType);
      this.logger.info({ key, contentType }, "File uploaded");
      return Result.ok(result);
    } catch (error) {
      this.logger.error({ key, error }, "Upload failed");
      return Result.err({ code: "UPLOAD_FAILED", message: error instanceof Error ? error.message : "Upload failed" });
    }
  }

  async getPresignedUploadUrl(key: string, contentType: string, ttlSeconds = PRESIGN_TTL_SECONDS): Promise<Result<string, StorageError>> {
    try {
      const url = await this.driver.getPresignedUploadUrl(key, contentType, ttlSeconds);
      return Result.ok(url);
    } catch (error) {
      this.logger.error({ key, error }, "Presign upload failed");
      return Result.err({ code: "PRESIGN_FAILED", message: error instanceof Error ? error.message : "Presign failed" });
    }
  }

  async getPresignedDownloadUrl(key: string, ttlSeconds = PRESIGN_TTL_SECONDS): Promise<Result<string, StorageError>> {
    try {
      const url = await this.driver.getPresignedDownloadUrl(key, ttlSeconds);
      return Result.ok(url);
    } catch (error) {
      this.logger.error({ key, error }, "Presign download failed");
      return Result.err({ code: "NOT_FOUND", message: error instanceof Error ? error.message : "File not found" });
    }
  }

  async delete(key: string): Promise<Result<void, StorageError>> {
    try {
      await this.driver.delete(key);
      this.logger.info({ key }, "File deleted");
      return Result.ok(undefined);
    } catch (error) {
      this.logger.error({ key, error }, "Delete failed");
      return Result.err({ code: "DELETE_FAILED", message: error instanceof Error ? error.message : "Delete failed" });
    }
  }
}

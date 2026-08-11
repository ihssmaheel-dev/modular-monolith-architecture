import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { env } from "../../config/env";
import { PinoLoggerService } from "../logger/logger.service";
import {
  StorageDriver,
  StorageError,
  UploadResult,
  FileInput,
  PRESIGN_TTL_SECONDS,
  StoredObjectMetadata,
} from "./storage.types";
import { S3Driver } from "./drivers/s3.driver";
import { GridFsDriver } from "./drivers/gridfs.driver";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
import { CircuitBreaker } from "../../common/utils/circuit-breaker";
import { Bulkhead } from "../../common/utils/bulkhead";

@Injectable()
export class StorageService {
  private driver: StorageDriver;
  private circuitBreaker: CircuitBreaker<StorageError>;
  private bulkhead: Bulkhead<StorageError>;

  constructor(
    private logger: PinoLoggerService,
    @InjectConnection() connection: Connection,
  ) {
    this.logger = logger.child({ module: "StorageService" });
    this.driver = this.createDriver(connection);

    this.circuitBreaker = new CircuitBreaker(
      { failureThreshold: 5, resetTimeoutMs: 10000 },
      { code: "CIRCUIT_OPEN", message: "api.error.circuitOpen" },
    );

    this.bulkhead = new Bulkhead(
      { maxConcurrent: 20 },
      { code: "BULKHEAD_REJECTED", message: "api.error.bulkheadRejected" },
    );
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

  async upload(
    key: string,
    body: FileInput,
    contentType: string,
  ): Promise<Result<UploadResult, StorageError>> {
    return this.bulkhead.execute(() =>
      this.circuitBreaker.execute(async () => {
        try {
          const result = await this.driver.upload(key, body, contentType);
          this.logger.info({ key, contentType }, "File uploaded");
          return ok(result);
        } catch (error) {
          this.logger.error({ key, error }, "Upload failed");
          return err({ code: "UPLOAD_FAILED", message: "api.error.uploadFailed" });
        }
      }),
    );
  }

  async getPresignedUploadUrl(
    key: string,
    contentType: string,
    ttlSeconds = PRESIGN_TTL_SECONDS,
  ): Promise<Result<string, StorageError>> {
    return this.bulkhead.execute(() =>
      this.circuitBreaker.execute(async () => {
        try {
          const url = await this.driver.getPresignedUploadUrl(key, contentType, ttlSeconds);
          return ok(url);
        } catch (error) {
          this.logger.error({ key, error }, "Presign upload failed");
          return err({ code: "PRESIGN_FAILED", message: "api.error.presignFailed" });
        }
      }),
    );
  }

  async getPresignedDownloadUrl(
    key: string,
    ttlSeconds = PRESIGN_TTL_SECONDS,
  ): Promise<Result<string, StorageError>> {
    return this.bulkhead.execute(() =>
      this.circuitBreaker.execute(async () => {
        try {
          const url = await this.driver.getPresignedDownloadUrl(key, ttlSeconds);
          return ok(url);
        } catch (error) {
          this.logger.error({ key, error }, "Presign download failed");
          return err({ code: "NOT_FOUND", message: "api.error.notFound" });
        }
      }),
    );
  }

  async delete(key: string): Promise<Result<void, StorageError>> {
    return this.bulkhead.execute(() =>
      this.circuitBreaker.execute(async () => {
        try {
          await this.driver.delete(key);
          this.logger.info({ key }, "File deleted");
          return ok(undefined);
        } catch (error) {
          this.logger.error({ key, error }, "Delete failed");
          return err({ code: "DELETE_FAILED", message: "api.error.deleteFailed" });
        }
      }),
    );
  }

  async getMetadata(key: string): Promise<Result<StoredObjectMetadata | null, StorageError>> {
    return this.bulkhead.execute(() =>
      this.circuitBreaker.execute(async () => {
        try {
          return ok(await this.driver.getMetadata(key));
        } catch (error) {
          this.logger.error({ key, error }, "Storage existence check failed");
          return err({ code: "NOT_FOUND", message: "api.error.notFound" });
        }
      }),
    );
  }
}

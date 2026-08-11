import { Readable } from "stream";

export const PRESIGN_TTL_SECONDS = 3600; // 1 hour

export interface StorageError {
  code:
    | "UPLOAD_FAILED"
    | "DELETE_FAILED"
    | "PRESIGN_FAILED"
    | "NOT_FOUND"
    | "CIRCUIT_OPEN"
    | "BULKHEAD_REJECTED";
  message: string;
}

export interface UploadResult {
  key: string;
  url: string;
}

export interface StoredObjectMetadata {
  size: number;
  contentType?: string;
}

export type FileInput = Buffer | Readable | ReadableStream;

export interface StorageDriver {
  upload(key: string, body: FileInput, contentType: string): Promise<UploadResult>;
  getPresignedUploadUrl(key: string, contentType: string, ttlSeconds?: number): Promise<string>;
  getPresignedDownloadUrl(key: string, ttlSeconds?: number): Promise<string>;
  getMetadata(key: string): Promise<StoredObjectMetadata | null>;
  delete(key: string): Promise<void>;
}

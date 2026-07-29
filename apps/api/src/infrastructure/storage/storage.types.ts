export const PRESIGN_TTL_SECONDS = 3600; // 1 hour

export interface StorageError {
  code: "UPLOAD_FAILED" | "DELETE_FAILED" | "PRESIGN_FAILED" | "NOT_FOUND";
  message: string;
}

export interface UploadResult {
  key: string;
  url: string;
}

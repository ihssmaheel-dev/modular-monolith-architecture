import { env } from "../../../config/env";
import { FileEntity } from "../domain/entities/file.entity";
import type { FileMetadataResponse } from "@repo/shared";

export function toFileResponse(file: FileEntity): FileMetadataResponse {
  if (env.STORAGE_DRIVER === "gridfs") return toGridFsResponse(file);
  const baseUrl =
    env.CDN_ENABLED && env.CDN_DOMAIN
      ? `https://${env.CDN_DOMAIN}/${env.CDN_BUCKET_PATH}`
      : `https://${file.bucket}.s3.${env.S3_REGION}.amazonaws.com`;

  return {
    id: file.id,
    key: file.key,
    fileName: file.fileName,
    contentType: file.contentType,
    fileSize: file.fileSize,
    bucket: file.bucket,
    url: `${baseUrl}/${file.key}`,
    parentId: file.parentId,
    parentType: file.parentType,
    uploadedBy: file.uploadedBy,
    status: file.status,
    createdAt: file.createdAt.toISOString(),
  };
}

function toGridFsResponse(file: FileEntity): FileMetadataResponse {
  return {
    id: file.id,
    key: file.key,
    fileName: file.fileName,
    contentType: file.contentType,
    fileSize: file.fileSize,
    bucket: file.bucket,
    url: new URL(`/api/files/${file.id}/content`, env.API_URL).toString(),
    parentId: file.parentId,
    parentType: file.parentType,
    uploadedBy: file.uploadedBy,
    status: file.status,
    createdAt: file.createdAt.toISOString(),
  };
}

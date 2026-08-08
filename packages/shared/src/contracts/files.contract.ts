import { initContract } from "@ts-rest/core";
import {
  RequestUploadSchema,
  ConfirmUploadSchema,
  FileMetadataSchema,
  PresignedUrlResponseSchema,
  FileListResponseSchema,
} from "../schemas/file.schema";

const c = initContract();

export const filesContract = c.router({
  requestUpload: {
    method: "POST" as const,
    path: "/files/upload-url",
    body: RequestUploadSchema as any,
    responses: {
      201: PresignedUrlResponseSchema as any,
      400: { message: "" } as any,
      413: { message: "" } as any,
    },
    summary: "Request a presigned URL for direct S3 upload",
  },
  confirmUpload: {
    method: "POST" as const,
    path: "/files/confirm",
    body: ConfirmUploadSchema as any,
    responses: {
      200: FileMetadataSchema as any,
      404: { message: "" } as any,
    },
    summary: "Confirm upload completed and persist metadata",
  },
  getDownloadUrl: {
    method: "GET" as const,
    path: "/files/:id/download-url",
    responses: {
      200: { downloadUrl: "" } as any,
      404: { message: "" } as any,
    },
    summary: "Get a presigned download URL for a file",
  },
  getById: {
    method: "GET" as const,
    path: "/files/:id",
    responses: {
      200: FileMetadataSchema as any,
      404: { message: "" } as any,
    },
    summary: "Get file metadata by ID",
  },
  listByParent: {
    method: "GET" as const,
    path: "/files",
    query: { parentId: undefined, parentType: undefined } as any,
    responses: {
      200: FileListResponseSchema as any,
    },
    summary: "List files by parent entity",
  },
  delete: {
    method: "DELETE" as const,
    path: "/files/:id",
    responses: {
      204: undefined as any,
      404: { message: "" } as any,
    },
    summary: "Delete a file",
  },
});

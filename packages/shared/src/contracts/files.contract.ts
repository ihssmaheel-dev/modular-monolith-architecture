import { initContract, type AppRouter } from "@ts-rest/core";
import {
  RequestUploadSchema,
  ConfirmUploadSchema,
  FileMetadataSchema,
  PresignedUrlResponseSchema,
  FileListResponseSchema,
  DownloadUrlResponseSchema,
} from "../schemas/file.schema";
import { MessageResponseSchema } from "../schemas/auth.schema";
import { PaginationQuerySchema } from "../schemas/pagination.schema";
import { z } from "zod";
import { contractSchema } from "./contract-schema";

const c = initContract();

export const filesContract = {
  requestUpload: {
    method: "POST" as const,
    path: "/files/upload-url",
    body: contractSchema(RequestUploadSchema),
    responses: {
      201: contractSchema(PresignedUrlResponseSchema),
      400: contractSchema(MessageResponseSchema),
      413: contractSchema(MessageResponseSchema),
    },
    summary: "Request a presigned URL for direct S3 upload",
  },
  confirmUpload: {
    method: "POST" as const,
    path: "/files/confirm",
    body: contractSchema(ConfirmUploadSchema),
    responses: {
      200: contractSchema(FileMetadataSchema),
      404: contractSchema(MessageResponseSchema),
    },
    summary: "Confirm upload completed and persist metadata",
  },
  getDownloadUrl: {
    method: "GET" as const,
    path: "/files/:id/download-url",
    responses: {
      200: contractSchema(DownloadUrlResponseSchema),
      404: contractSchema(MessageResponseSchema),
    },
    summary: "Get a presigned download URL for a file",
  },
  getById: {
    method: "GET" as const,
    path: "/files/:id",
    responses: {
      200: contractSchema(FileMetadataSchema),
      404: contractSchema(MessageResponseSchema),
    },
    summary: "Get file metadata by ID",
  },
  listByParent: {
    method: "GET" as const,
    path: "/files",
    query: contractSchema(
      PaginationQuerySchema.extend({
        parentId: z.string().optional(),
        parentType: z.enum(["note", "user", "general"]),
      }),
    ),
    responses: {
      200: contractSchema(FileListResponseSchema),
    },
    summary: "List files by parent entity",
  },
  delete: {
    method: "DELETE" as const,
    path: "/files/:id",
    responses: {
      204: c.noBody(),
      404: contractSchema(MessageResponseSchema),
    },
    summary: "Delete a file",
  },
} as const satisfies AppRouter;

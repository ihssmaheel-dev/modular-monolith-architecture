import type {
  ConfirmUploadInput,
  DownloadUrlResponse,
  FileListResponse,
  FileMetadataResponse,
  PresignedUrlResponse,
  RequestUploadInput,
} from "@repo/contracts";
import type { FetchFn } from "../types";
import { orpcResponse, type OrpcClient } from "../orpc";

type FileListQuery = {
  page?: number;
  limit?: number;
  parentId?: string;
  parentType?: "note" | "user" | "general";
};

export function createFilesClient(fetchFn: FetchFn, orpc?: OrpcClient) {
  return {
    requestUpload: (req: { body: RequestUploadInput }) =>
      orpc
        ? orpcResponse(() => orpc.files.requestUpload(req.body), 201)
        : fetchFn<PresignedUrlResponse>("/files/upload-url", {
            method: "POST",
            body: JSON.stringify(req.body),
          }),
    confirmUpload: (req: { body: ConfirmUploadInput }) =>
      orpc
        ? orpcResponse(() => orpc.files.confirmUpload(req.body), 200)
        : fetchFn<FileMetadataResponse>("/files/confirm", {
            method: "POST",
            body: JSON.stringify(req.body),
          }),
    getDownloadUrl: (req: { params: { id: string } }) =>
      orpc
        ? orpcResponse(() => orpc.files.getDownloadUrl({ id: req.params.id }), 200)
        : fetchFn<DownloadUrlResponse>(`/files/${encodeURIComponent(req.params.id)}/download-url`),
    getById: (req: { params: { id: string } }) =>
      orpc
        ? orpcResponse(() => orpc.files.getById({ id: req.params.id }), 200)
        : fetchFn<FileMetadataResponse>(`/files/${encodeURIComponent(req.params.id)}`),
    listByParent: (req: { query?: FileListQuery } = {}) => {
      const parentType = req.query?.parentType;
      if (orpc && parentType) {
        return orpcResponse(
          () =>
            orpc.files.listByParent({
              page: req.query?.page,
              limit: req.query?.limit,
              parentId: req.query?.parentId,
              parentType,
            }),
          200,
        );
      }
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(req.query ?? {})) {
        if (v !== undefined) sp.set(k, String(v));
      }
      const qs = sp.toString();
      return fetchFn<FileListResponse>(`/files${qs ? `?${qs}` : ""}`);
    },
    delete: (req: { params: { id: string } }) =>
      orpc
        ? orpcResponse(() => orpc.files.delete({ id: req.params.id }), 204)
        : fetchFn<void>(`/files/${encodeURIComponent(req.params.id)}`, { method: "DELETE" }),
  };
}

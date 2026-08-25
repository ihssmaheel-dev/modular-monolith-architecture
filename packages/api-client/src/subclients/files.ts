import type { ConfirmUploadInput, DownloadUrlResponse, FileListResponse, FileMetadataResponse, PresignedUrlResponse, RequestUploadInput } from "@repo/contracts";
import type { FetchFn } from "../types";

export function createFilesClient(fetchFn: FetchFn) {
  return {
    requestUpload: (req: { body: RequestUploadInput }) =>
      fetchFn<PresignedUrlResponse>("/files/upload-url", {
        method: "POST",
        body: JSON.stringify(req.body),
      }),
    confirmUpload: (req: { body: ConfirmUploadInput }) =>
      fetchFn<FileMetadataResponse>("/files/confirm", {
        method: "POST",
        body: JSON.stringify(req.body),
      }),
    getDownloadUrl: (req: { params: { id: string } }) =>
      fetchFn<DownloadUrlResponse>(`/files/${encodeURIComponent(req.params.id)}/download-url`),
    getById: (req: { params: { id: string } }) =>
      fetchFn<FileMetadataResponse>(`/files/${encodeURIComponent(req.params.id)}`),
    listByParent: (req: { query?: Record<string, string | number | undefined> } = {}) => {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(req.query ?? {})) {
        if (v !== undefined) sp.set(k, String(v));
      }
      const qs = sp.toString();
      return fetchFn<FileListResponse>(`/files${qs ? `?${qs}` : ""}`);
    },
    delete: (req: { params: { id: string } }) =>
      fetchFn<void>(`/files/${encodeURIComponent(req.params.id)}`, { method: "DELETE" }),
  };
}

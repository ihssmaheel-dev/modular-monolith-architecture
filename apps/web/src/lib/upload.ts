import type { ApiClient } from "@repo/api-client";
import { RequestUploadSchema, type FileMetadataResponse } from "@repo/shared";

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export interface UploadFileParams {
  file: File;
  parentId?: string;
  parentType?: "note" | "user" | "general";
  onProgress?: (progress: UploadProgress) => void;
  api: ApiClient;
}

export async function uploadFile({
  file,
  parentId,
  parentType,
  onProgress,
  api,
}: UploadFileParams): Promise<FileMetadataResponse> {
  const requestInput = RequestUploadSchema.parse({
    fileName: file.name,
    contentType: file.type,
    fileSize: file.size,
    parentId,
    parentType: parentType ?? "general",
  });

  const presignResult = await api.files.requestUpload({
    body: requestInput,
  });

  if (presignResult.status !== 201) {
    throw new Error("Failed to get upload URL");
  }

  const { uploadMode, uploadUrl, fileKey } = presignResult.body;

  await uploadContent(uploadMode, uploadUrl, file, api.getTransferHeaders(), onProgress);

  const confirmResult = await api.files.confirmUpload({
    body: { fileKey },
  });

  if (confirmResult.status !== 200) {
    throw new Error("Failed to confirm upload");
  }

  return confirmResult.body;
}

function uploadContent(
  mode: "direct" | "proxy",
  url: string,
  file: File,
  headers: Record<string, string>,
  onProgress?: (progress: UploadProgress) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event: ProgressEvent<XMLHttpRequestUpload>) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percent: Math.round((event.loaded / event.total) * 100),
        });
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    xhr.open("PUT", url);
    xhr.withCredentials = mode === "proxy";
    xhr.setRequestHeader("Content-Type", mode === "proxy" ? "application/octet-stream" : file.type);
    if (mode === "proxy") {
      for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    }
    xhr.send(file);
  });
}

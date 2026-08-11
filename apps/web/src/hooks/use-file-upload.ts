import { useState, useCallback } from "react";
import { uploadFile, type UploadProgress } from "@/lib/upload";
import type { ApiClient } from "@repo/api-client";
import type { FileMetadataResponse } from "@repo/shared";
import { useTranslation } from "react-i18next";

export interface UseFileUploadReturn {
  upload: (params: {
    file: File;
    parentId?: string;
    parentType?: "note" | "user" | "general";
  }) => Promise<FileMetadataResponse>;
  progress: UploadProgress | null;
  isUploading: boolean;
  error: string | null;
  reset: () => void;
}

export function useFileUpload(api: ApiClient): UseFileUploadReturn {
  const { t } = useTranslation();
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setProgress(null);
    setIsUploading(false);
    setError(null);
  }, []);

  const upload = useCallback(
    async (params: {
      file: File;
      parentId?: string;
      parentType?: "note" | "user" | "general";
    }): Promise<FileMetadataResponse> => {
      setIsUploading(true);
      setProgress(null);
      setError(null);

      try {
        const result = await uploadFile({
          ...params,
          api,
          onProgress: setProgress,
        });
        return result;
      } catch (err) {
        setError(t("api.error.uploadFailed"));
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [api, t],
  );

  return { upload, progress, isUploading, error, reset };
}

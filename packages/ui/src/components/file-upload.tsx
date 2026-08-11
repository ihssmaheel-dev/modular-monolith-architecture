import * as React from "react";
import { cn } from "../lib/utils";
import { Spinner } from "./spinner";
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_MB } from "@repo/shared";

export interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string[];
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
  labels: {
    loading: string;
    uploading: string;
    prompt: string;
    maxSize: (size: number) => string;
    invalidType: (type: string) => string;
    tooLarge: (size: number) => string;
    uploadFailed: string;
  };
}

export function FileUpload({
  onUpload,
  accept = [...ALLOWED_MIME_TYPES],
  maxSizeMB = MAX_FILE_SIZE_MB,
  disabled = false,
  className,
  labels,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!accept.includes(file.type)) {
      return labels.invalidType(file.type);
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return labels.tooLarge(maxSizeMB);
    }
    return null;
  };

  const handleFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.uploadFailed);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isUploading) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !isUploading && inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled || isUploading ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        )}
      >
        {isUploading ? (
          <Spinner className="h-8 w-8" label={labels.loading} />
        ) : (
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        )}
        <p className="text-sm text-muted-foreground">
          {isUploading ? labels.uploading : labels.prompt}
        </p>
        <p className="text-xs text-muted-foreground/70">{labels.maxSize(maxSizeMB)}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept.join(",")}
        onChange={handleChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}

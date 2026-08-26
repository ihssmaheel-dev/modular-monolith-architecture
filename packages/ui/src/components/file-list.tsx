import { cn } from "../lib/utils";
import { Button } from "./button";
import { Spinner } from "./spinner";
import type { FileMetadataResponse } from "@repo/contracts";

export interface FileListProps {
  files: FileMetadataResponse[];
  isLoading?: boolean;
  onDelete?: (fileId: string) => void;
  className?: string;
  labels: {
    loading: string;
    empty: string;
    download: string;
    delete: string;
    image: string;
    pdf: string;
    text: string;
    file: string;
  };
}

export function FileList({ files, isLoading = false, onDelete, className, labels }: FileListProps) {
  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <Spinner label={labels.loading} />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className={cn("text-center text-sm text-muted-foreground p-8", className)}>
        {labels.empty}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {files.map((file) => (
        <FileListItem key={file.id} file={file} onDelete={onDelete} labels={labels} />
      ))}
    </div>
  );
}

interface FileListItemProps {
  file: FileMetadataResponse;
  onDelete?: (fileId: string) => void;
  labels: FileListProps["labels"];
}

function FileListItem({ file, onDelete, labels }: FileListItemProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (contentType: string): string => {
    if (contentType.startsWith("image/")) return labels.image;
    if (contentType === "application/pdf") return labels.pdf;
    if (contentType.startsWith("text/")) return labels.text;
    return labels.file;
  };

  return (
    <div className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
        <span className="text-xs font-medium uppercase">{getFileIcon(file.contentType)}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.fileName}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.fileSize)} &middot; {file.contentType}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium hover:bg-muted"
          aria-label={labels.download}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </a>

        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(file.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            aria-label={labels.delete}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}

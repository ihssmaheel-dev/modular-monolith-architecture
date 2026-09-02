export interface FileEntity {
  id: string;
  tenantId?: string;
  key: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  bucket: string;
  parentId?: string;
  parentType: "note" | "user" | "general";
  uploadedBy: string;
  status: "pending" | "uploading" | "scanning" | "uploaded" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../../../infrastructure/database";
import { TenantContextService } from "../../../infrastructure/database";
import { BaseRepository } from "../../../infrastructure/database";
import { files, type FileRow } from "./schemas/file.schema";
import type { FileEntity } from "../domain/entities/file.entity";

@Injectable()
export class FilesRepository extends BaseRepository<FileEntity, FileRow> {
  constructor(database: DatabaseService, tenantContext: TenantContextService) {
    super(files, database, tenantContext, true);
  }

  protected toDomain(row: FileRow): FileEntity {
    return {
      id: row.id,
      key: row.key,
      fileName: row.fileName,
      contentType: row.contentType,
      fileSize: row.fileSize,
      bucket: row.bucket,
      parentId: row.parentId ?? undefined,
      parentType: row.parentType as FileEntity["parentType"],
      uploadedBy: row.uploadedBy,
      status: row.status as FileEntity["status"],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findByKey(key: string): Promise<FileEntity | null> {
    const result = await this.findOne({ key });
    return result.isOk() ? result.value : null;
  }

  async findByParent(parentType: string, parentId: string): Promise<FileEntity[]> {
    const result = await this.find({ parentType, parentId });
    return result.isOk() ? result.value : [];
  }

  async claimPendingUpload(key: string) {
    return this.updateOne({ key, status: "pending" }, { status: "uploading" });
  }
}

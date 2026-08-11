import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FlattenMaps, Model } from "mongoose";
import { ClsService } from "nestjs-cls";
import { TenantScopedRepository } from "../../../infrastructure/database/tenant-scoped.repository";
import { FileEntity } from "../domain/entities/file.entity";
import { FileMongooseSchema } from "./schemas/file.mongoose.schema";

type LeanFileDocument = FlattenMaps<FileMongooseSchema> & {
  _id: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class FilesRepository extends TenantScopedRepository<FileEntity, FileMongooseSchema> {
  constructor(
    @InjectModel(FileMongooseSchema.name) model: Model<FileMongooseSchema>,
    cls: ClsService,
  ) {
    super(model, cls);
  }

  protected toDomain(value: unknown): FileEntity {
    const doc = value as LeanFileDocument;
    return {
      id: doc._id.toString(),
      key: doc.key,
      fileName: doc.fileName,
      contentType: doc.contentType,
      fileSize: doc.fileSize,
      bucket: doc.bucket,
      parentId: doc.parentId,
      parentType: doc.parentType as FileEntity["parentType"],
      uploadedBy: doc.uploadedBy,
      status: doc.status as FileEntity["status"],
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
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
}

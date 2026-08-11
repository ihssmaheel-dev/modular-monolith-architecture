import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FlattenMaps, Model } from "mongoose";
import { BaseRepository } from "../../../infrastructure/database/base.repository";
import { FileEntity } from "../domain/entities/file.entity";
import { FileMongooseSchema } from "./schemas/file.mongoose.schema";

type LeanFileDocument = FlattenMaps<FileMongooseSchema> & {
  _id: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class FilesRepository extends BaseRepository<FileEntity, FileMongooseSchema> {
  constructor(@InjectModel(FileMongooseSchema.name) model: Model<FileMongooseSchema>) {
    super(model);
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
    const doc = await this.model
      .findOne({ key, deletedAt: { $exists: false } })
      .lean()
      .exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByParent(parentType: string, parentId: string): Promise<FileEntity[]> {
    const docs = await this.model
      .find({ parentType, parentId, deletedAt: { $exists: false } })
      .lean()
      .exec();
    return docs.map((doc) => this.toDomain(doc));
  }
}

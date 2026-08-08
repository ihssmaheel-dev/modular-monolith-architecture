import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { BaseRepository } from "../../../infrastructure/database/base.repository";
import { FileEntity } from "../domain/entities/file.entity";
import { FileMongooseSchema } from "./schemas/file.mongoose.schema";

@Injectable()
export class FilesRepository extends BaseRepository<FileEntity, FileMongooseSchema> {
  constructor(
    @InjectModel(FileMongooseSchema.name) model: Model<FileMongooseSchema>,
  ) {
    super(model);
  }

  protected toDomain(doc: any): FileEntity {
    return {
      id: doc._id.toString(),
      key: doc.key,
      fileName: doc.fileName,
      contentType: doc.contentType,
      fileSize: doc.fileSize,
      bucket: doc.bucket,
      parentId: doc.parentId,
      parentType: doc.parentType,
      uploadedBy: doc.uploadedBy,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findByKey(key: string): Promise<FileEntity | null> {
    const doc = await this.model.findOne({ key }).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByParent(parentType: string, parentId: string): Promise<FileEntity[]> {
    const docs = await this.model.find({ parentType, parentId }).exec();
    return docs.map((doc) => this.toDomain(doc));
  }
}

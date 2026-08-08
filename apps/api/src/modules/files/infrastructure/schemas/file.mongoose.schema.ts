import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type FileDocument = HydratedDocument<FileMongooseSchema>;

@Schema({ timestamps: true, collection: "files" })
export class FileMongooseSchema {
  @Prop({ required: true, unique: true, index: true })
  key!: string;

  @Prop({ required: true })
  fileName!: string;

  @Prop({ required: true })
  contentType!: string;

  @Prop({ required: true })
  fileSize!: number;

  @Prop({ required: true })
  bucket!: string;

  @Prop({ index: true })
  parentId?: string;

  @Prop({ enum: ["note", "user", "general"], default: "general" })
  parentType!: string;

  @Prop({ required: true, index: true })
  uploadedBy!: string;

  @Prop({ enum: ["pending", "uploaded", "failed"], default: "pending" })
  status!: string;
}

export const FileSchema = SchemaFactory.createForClass(FileMongooseSchema);

FileSchema.index({ parentType: 1, parentId: 1 });

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type FileDocument = HydratedDocument<FileMongooseSchema>;

@Schema({ timestamps: true, collection: "files" })
export class FileMongooseSchema {
  @Prop({ type: String })
  tenantId?: string;

  @Prop({ type: String, required: true })
  key!: string;

  @Prop({ type: String, required: true })
  fileName!: string;

  @Prop({ type: String, required: true })
  contentType!: string;

  @Prop({ type: Number, required: true })
  fileSize!: number;

  @Prop({ type: String, required: true })
  bucket!: string;

  @Prop({ type: String })
  parentId?: string;

  @Prop({ type: String, enum: ["note", "user", "general"], default: "general" })
  parentType!: string;

  @Prop({ type: String, required: true })
  uploadedBy!: string;

  @Prop({ type: String, enum: ["pending", "uploading", "uploaded", "failed"], default: "pending" })
  status!: string;
}

export const FileSchema = SchemaFactory.createForClass(FileMongooseSchema);

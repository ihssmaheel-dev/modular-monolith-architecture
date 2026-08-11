import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type FileDocument = HydratedDocument<FileMongooseSchema>;

@Schema({ timestamps: true, collection: "files" })
export class FileMongooseSchema {
  @Prop({ required: true })
  key!: string;

  @Prop({ required: true })
  fileName!: string;

  @Prop({ required: true })
  contentType!: string;

  @Prop({ required: true })
  fileSize!: number;

  @Prop({ required: true })
  bucket!: string;

  @Prop()
  parentId?: string;

  @Prop({ enum: ["note", "user", "general"], default: "general" })
  parentType!: string;

  @Prop({ required: true })
  uploadedBy!: string;

  @Prop({ enum: ["pending", "uploaded", "failed"], default: "pending" })
  status!: string;
}

export const FileSchema = SchemaFactory.createForClass(FileMongooseSchema);

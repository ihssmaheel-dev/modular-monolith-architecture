import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type NoteDocument = HydratedDocument<NoteMongooseSchema>;

@Schema({ timestamps: true, collection: "notes" })
export class NoteMongooseSchema {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  content!: string;

  @Prop()
  deletedAt?: Date;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;
}

export const NoteSchema = SchemaFactory.createForClass(NoteMongooseSchema);

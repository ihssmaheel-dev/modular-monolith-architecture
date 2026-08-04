import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

@Schema({ collection: "audit_logs", timestamps: { createdAt: true, updatedAt: false } })
export class AuditLogMongooseSchema extends Document {
  @Prop({ required: true, index: true })
  collectionName!: string;

  @Prop({ required: true, index: true })
  documentId!: string;

  @Prop({ required: true, enum: ["CREATE", "UPDATE", "DELETE"] })
  action!: string;

  @Prop({ type: String, required: false, index: true })
  actorId?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  before?: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  after?: any;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLogMongooseSchema);

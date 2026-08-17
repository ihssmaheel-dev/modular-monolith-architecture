import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

@Schema({ collection: "audit_logs", timestamps: { createdAt: true, updatedAt: false } })
export class AuditLogMongooseSchema extends Document {
  @Prop({ type: String, required: true })
  collectionName!: string;

  @Prop({ type: String, required: true })
  documentId!: string;

  @Prop({ type: String, required: true, enum: ["CREATE", "UPDATE", "DELETE"] })
  action!: string;

  @Prop({ type: String, required: false })
  actorId?: string;

  @Prop({ type: String, required: false })
  tenantId?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  before?: unknown;

  @Prop({ type: MongooseSchema.Types.Mixed })
  after?: unknown;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLogMongooseSchema);

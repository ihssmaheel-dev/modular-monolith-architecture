import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

@Schema({ collection: "outbox_events", timestamps: { createdAt: true, updatedAt: true } })
export class OutboxEventMongooseSchema extends Document {
  @Prop({ required: true, index: true })
  topic!: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  payload!: any;

  @Prop({ required: true, enum: ["PENDING", "PROCESSING", "PUBLISHED", "FAILED"], default: "PENDING", index: true })
  status!: string;

  @Prop({ required: false })
  error?: string;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt!: Date;
}

export const OutboxEventSchema = SchemaFactory.createForClass(OutboxEventMongooseSchema);

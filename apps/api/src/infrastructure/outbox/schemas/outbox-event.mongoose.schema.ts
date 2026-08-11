import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

@Schema({ collection: "outbox_events", timestamps: { createdAt: true, updatedAt: true } })
export class OutboxEventMongooseSchema extends Document {
  @Prop()
  tenantId?: string;

  @Prop({ required: true })
  topic!: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  payload!: unknown;

  @Prop({
    required: true,
    enum: ["PENDING", "PROCESSING", "PUBLISHED", "FAILED"],
    default: "PENDING",
  })
  status!: string;

  @Prop({ required: false })
  error?: string;

  @Prop({ required: true, default: 0 })
  attempts!: number;

  @Prop({ type: Date })
  nextAttemptAt?: Date;

  @Prop({ type: Date })
  lockedAt?: Date;

  @Prop({ type: Date, default: Date.now })
  createdAt!: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt!: Date;
}

export const OutboxEventSchema = SchemaFactory.createForClass(OutboxEventMongooseSchema);

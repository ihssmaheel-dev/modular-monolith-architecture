import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<UserMongooseSchema>;

@Schema({ timestamps: true, collection: "users" })
export class UserMongooseSchema {
  @Prop({ type: String, required: true })
  email!: string;

  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true, select: false })
  passwordHash!: string;

  @Prop({ type: String, select: false })
  passwordResetTokenHash?: string;

  @Prop({ type: Date, select: false })
  passwordResetExpiresAt?: Date;

  @Prop({ type: String, required: true, enum: ["admin", "user"], default: "user" })
  role!: string;

  @Prop({ type: Number, required: true, default: 0 })
  authVersion!: number;
}

export const UserSchema = SchemaFactory.createForClass(UserMongooseSchema);

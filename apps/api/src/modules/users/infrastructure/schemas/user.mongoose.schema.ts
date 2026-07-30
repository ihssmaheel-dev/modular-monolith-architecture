import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<UserMongooseSchema>;

@Schema({ timestamps: true, collection: "users" })
export class UserMongooseSchema {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ required: true, enum: ["admin", "user"], default: "user" })
  role!: string;
}

export const UserSchema = SchemaFactory.createForClass(UserMongooseSchema);

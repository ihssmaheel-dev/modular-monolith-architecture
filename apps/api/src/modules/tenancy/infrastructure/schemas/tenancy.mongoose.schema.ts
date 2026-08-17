import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true, collection: "organizations" })
export class OrganizationMongooseSchema {
  @Prop({ type: String, required: true })
  name!: string;

  @Prop({ type: String, required: true })
  slug!: string;

  @Prop({ type: String, required: true })
  createdBy!: string;
}

@Schema({ timestamps: true, collection: "memberships" })
export class MembershipMongooseSchema {
  @Prop({ type: String, required: true })
  tenantId!: string;

  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ type: String, required: true })
  userEmail!: string;

  @Prop({ type: String, required: true })
  userName!: string;

  @Prop({ type: String, required: true, enum: ["owner", "admin", "member"] })
  role!: string;
}

@Schema({ timestamps: true, collection: "invitations" })
export class InvitationMongooseSchema {
  @Prop({ type: String, required: true })
  tenantId!: string;

  @Prop({ type: String, required: true })
  email!: string;

  @Prop({ type: String, required: true, enum: ["admin", "member"] })
  role!: string;

  @Prop({ type: String, required: true, select: false })
  tokenHash!: string;

  @Prop({ type: String, required: true })
  invitedBy!: string;

  @Prop({ type: String, required: true, enum: ["pending", "accepted", "revoked"], default: "pending" })
  status!: string;

  @Prop({ type: Date, required: true })
  expiresAt!: Date;

  @Prop({ type: String })
  acceptedBy?: string;

  @Prop({ type: Date })
  acceptedAt?: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(OrganizationMongooseSchema);
export const MembershipSchema = SchemaFactory.createForClass(MembershipMongooseSchema);
export const InvitationSchema = SchemaFactory.createForClass(InvitationMongooseSchema);

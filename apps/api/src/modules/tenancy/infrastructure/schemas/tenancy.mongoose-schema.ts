import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true, collection: "organizations" })
export class OrganizationMongooseSchema {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  slug!: string;

  @Prop({ required: true })
  createdBy!: string;
}

@Schema({ timestamps: true, collection: "memberships" })
export class MembershipMongooseSchema {
  @Prop({ required: true })
  tenantId!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  userEmail!: string;

  @Prop({ required: true })
  userName!: string;

  @Prop({ required: true, enum: ["owner", "admin", "member"] })
  role!: string;
}

@Schema({ timestamps: true, collection: "invitations" })
export class InvitationMongooseSchema {
  @Prop({ required: true })
  tenantId!: string;

  @Prop({ required: true })
  email!: string;

  @Prop({ required: true, enum: ["admin", "member"] })
  role!: string;

  @Prop({ required: true, select: false })
  tokenHash!: string;

  @Prop({ required: true })
  invitedBy!: string;

  @Prop({ required: true, enum: ["pending", "accepted", "revoked"], default: "pending" })
  status!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop()
  acceptedBy?: string;

  @Prop()
  acceptedAt?: Date;
}

export const OrganizationSchema = SchemaFactory.createForClass(OrganizationMongooseSchema);
export const MembershipSchema = SchemaFactory.createForClass(MembershipMongooseSchema);
export const InvitationSchema = SchemaFactory.createForClass(InvitationMongooseSchema);

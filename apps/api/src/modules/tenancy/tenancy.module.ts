import { DynamicModule, Global, Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { MongooseModule } from "@nestjs/mongoose";
import { env } from "../../config/env";
import { AcceptInvitationCommand } from "./application/commands/accept-invitation.command";
import { CreateOrganizationCommand } from "./application/commands/create-organization.command";
import { InviteMemberCommand } from "./application/commands/invite-member.command";
import { RemoveMemberCommand } from "./application/commands/remove-member.command";
import { UpdateMemberCommand } from "./application/commands/update-member.command";
import { InvitationEmailListener } from "./application/listeners/invitation-email.listener";
import { MembershipUserListener } from "./application/listeners/membership-user.listener";
import { ListInvitationsQuery } from "./application/queries/list-invitations.query";
import { ListMembersQuery } from "./application/queries/list-members.query";
import { ListOrganizationsQuery } from "./application/queries/list-organizations.query";
import { ResolveTenantAccessQuery } from "./application/queries/resolve-tenant-access.query";
import { CanDeleteUserQuery } from "./application/queries/can-delete-user.query";
import { InvitationsRepository } from "./infrastructure/invitations.repository";
import { MembershipsRepository } from "./infrastructure/memberships.repository";
import { OrganizationsRepository } from "./infrastructure/organizations.repository";
import {
  InvitationMongooseSchema,
  InvitationSchema,
  MembershipMongooseSchema,
  MembershipSchema,
  OrganizationMongooseSchema,
  OrganizationSchema,
} from "./infrastructure/schemas/tenancy.mongoose.schema";
import { MembershipsController } from "./presentation/memberships.controller";
import { OrganizationsController } from "./presentation/organizations.controller";
import { TenancyStatusController } from "./presentation/tenancy-status.controller";

const tenancyModels = MongooseModule.forFeature([
  { name: OrganizationMongooseSchema.name, schema: OrganizationSchema },
  { name: MembershipMongooseSchema.name, schema: MembershipSchema },
  { name: InvitationMongooseSchema.name, schema: InvitationSchema },
]);

const providers = [
  OrganizationsRepository,
  MembershipsRepository,
  InvitationsRepository,
  ResolveTenantAccessQuery,
  CreateOrganizationCommand,
  ListOrganizationsQuery,
  ListMembersQuery,
  ListInvitationsQuery,
  InviteMemberCommand,
  AcceptInvitationCommand,
  UpdateMemberCommand,
  RemoveMemberCommand,
  InvitationEmailListener,
  MembershipUserListener,
  CanDeleteUserQuery,
];

@Global()
@Module({})
export class TenancyModule {
  static forRoot(): DynamicModule {
    const domainControllers =
      env.TENANCY_MODE === "multi" ? [OrganizationsController, MembershipsController] : [];
    return {
      module: TenancyModule,
      imports: [tenancyModels, EventEmitterModule],
      controllers: [TenancyStatusController, ...domainControllers],
      providers,
      exports: [ResolveTenantAccessQuery, CanDeleteUserQuery],
    };
  }
}

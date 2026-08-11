import { Controller, Req } from "@nestjs/common";
import { TsRestHandler, tsRestHandler } from "@ts-rest/nest";
import type { FastifyRequest } from "fastify";
import { tenancyContract } from "@repo/shared";
import {
  Idempotent,
  RequirePermissions,
  TenantAgnostic,
  requireAuthenticatedUser,
} from "../../../common";
import { handleResult } from "../../../common/utils/presentation.utils";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import { AcceptInvitationCommand } from "../application/commands/accept-invitation.command";
import { InviteMemberCommand } from "../application/commands/invite-member.command";
import { RemoveMemberCommand } from "../application/commands/remove-member.command";
import { UpdateMemberCommand } from "../application/commands/update-member.command";
import { ListInvitationsQuery } from "../application/queries/list-invitations.query";
import { ListMembersQuery } from "../application/queries/list-members.query";
import { INVITATION_ERRORS, MEMBERSHIP_ERRORS } from "./tenancy.error-maps";
import { toInvitationResponse, toMemberResponse } from "./tenancy.mapper";

@Controller("tenancy")
export class MembershipsController {
  constructor(
    private readonly listMembers: ListMembersQuery,
    private readonly updateMember: UpdateMemberCommand,
    private readonly removeMember: RemoveMemberCommand,
    private readonly inviteMember: InviteMemberCommand,
    private readonly listInvitations: ListInvitationsQuery,
    private readonly acceptInvitation: AcceptInvitationCommand,
    private readonly i18n: I18nService,
  ) {}

  @TsRestHandler(tenancyContract.listMembers)
  @RequirePermissions("members:read")
  listMemberPage(@Req() request: FastifyRequest) {
    return tsRestHandler(tenancyContract.listMembers, async ({ query }) => {
      const result = await this.listMembers.execute(query.page, query.limit);
      const value = this.handle(result, MEMBERSHIP_ERRORS, request);
      return { status: 200 as const, body: { ...value, items: value.items.map(toMemberResponse) } };
    });
  }

  @TsRestHandler(tenancyContract.updateMember)
  @Idempotent()
  @RequirePermissions("members:write")
  update(@Req() request: FastifyRequest) {
    return tsRestHandler(tenancyContract.updateMember, async ({ params, body }) => {
      const result = await this.updateMember.execute(params.userId, body.role);
      return {
        status: 200 as const,
        body: toMemberResponse(this.handle(result, MEMBERSHIP_ERRORS, request)),
      };
    });
  }

  @TsRestHandler(tenancyContract.removeMember)
  @Idempotent()
  @RequirePermissions("members:write")
  remove(@Req() request: FastifyRequest) {
    return tsRestHandler(tenancyContract.removeMember, async ({ params }) => {
      this.handle(await this.removeMember.execute(params.userId), MEMBERSHIP_ERRORS, request);
      return { status: 204 as const, body: undefined };
    });
  }

  @TsRestHandler(tenancyContract.inviteMember)
  @Idempotent()
  @RequirePermissions("invitations:write")
  invite(@Req() request: FastifyRequest) {
    return tsRestHandler(tenancyContract.inviteMember, async ({ body }) => {
      const actor = requireAuthenticatedUser(request);
      const locale = this.i18n.getLocale(request.headers["accept-language"]);
      const result = await this.inviteMember.execute(body, actor, locale);
      return {
        status: 201 as const,
        body: toInvitationResponse(this.handle(result, INVITATION_ERRORS, request)),
      };
    });
  }

  @TsRestHandler(tenancyContract.listInvitations)
  @RequirePermissions("invitations:read")
  listInvitationPage(@Req() request: FastifyRequest) {
    return tsRestHandler(tenancyContract.listInvitations, async ({ query }) => {
      const value = this.handle(
        await this.listInvitations.execute(query.page, query.limit),
        INVITATION_ERRORS,
        request,
      );
      return {
        status: 200 as const,
        body: { ...value, items: value.items.map(toInvitationResponse) },
      };
    });
  }

  @TsRestHandler(tenancyContract.acceptInvitation)
  @TenantAgnostic()
  @Idempotent()
  accept(@Req() request: FastifyRequest) {
    return tsRestHandler(tenancyContract.acceptInvitation, async ({ body }) => {
      const actor = requireAuthenticatedUser(request);
      const value = this.handle(
        await this.acceptInvitation.execute(body.token, actor),
        INVITATION_ERRORS,
        request,
      );
      return { status: 200 as const, body: toMemberResponse(value) };
    });
  }

  private handle<T>(
    result: Parameters<typeof handleResult<T, unknown>>[0],
    errors: Parameters<typeof handleResult>[1],
    request: FastifyRequest,
  ): T {
    return handleResult(result, errors, this.i18n, request.headers["accept-language"]);
  }
}

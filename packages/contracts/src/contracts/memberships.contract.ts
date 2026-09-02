import { oc } from "@orpc/contract";
import {
  AcceptInvitationSchema,
  InvitationListResponseSchema,
  InvitationResponseSchema,
  InviteMemberSchema,
  MemberListResponseSchema,
  MemberResponseSchema,
  PaginationQuerySchema,
  TenantHeaderSchema,
  UpdateMemberSchema,
  MemberUserIdParamSchema,
} from "../schemas";
import { z } from "zod";
import { EmptyResponseSchema } from "../schemas/common.schema";

export const membershipsContract = oc.prefix("/tenancy").router({
  listMembers: oc
    .route({
      method: "GET",
      path: "/members",
      summary: "List members of the active organization",
      inputStructure: "detailed",
    })
    .input(z.object({ query: PaginationQuerySchema, headers: TenantHeaderSchema }))
    .output(MemberListResponseSchema),
  updateMember: oc
    .route({
      method: "PATCH",
      path: "/members/{userId}",
      summary: "Change an organization member role",
      inputStructure: "detailed",
    })
    .input(
      z.object({
        params: MemberUserIdParamSchema,
        body: UpdateMemberSchema,
        headers: TenantHeaderSchema,
      }),
    )
    .output(MemberResponseSchema),
  removeMember: oc
    .route({
      method: "DELETE",
      path: "/members/{userId}",
      summary: "Remove a member from the active organization",
      successStatus: 204,
      inputStructure: "detailed",
    })
    .input(z.object({ params: MemberUserIdParamSchema, headers: TenantHeaderSchema }))
    .output(EmptyResponseSchema),
  inviteMember: oc
    .route({
      method: "POST",
      path: "/invitations",
      summary: "Invite a user to the active organization",
      successStatus: 201,
      inputStructure: "detailed",
    })
    .input(z.object({ body: InviteMemberSchema, headers: TenantHeaderSchema }))
    .output(InvitationResponseSchema),
  listInvitations: oc
    .route({
      method: "GET",
      path: "/invitations",
      summary: "List invitations for the active organization",
      inputStructure: "detailed",
    })
    .input(z.object({ query: PaginationQuerySchema, headers: TenantHeaderSchema }))
    .output(InvitationListResponseSchema),
  acceptInvitation: oc
    .route({
      method: "POST",
      path: "/invitations/accept",
      summary: "Accept an organization invitation",
    })
    .input(AcceptInvitationSchema)
    .output(MemberResponseSchema),
});

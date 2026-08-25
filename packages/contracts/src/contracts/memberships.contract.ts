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

export const membershipsContract = oc.prefix("/tenancy").router({
  listMembers: oc
    .route({ method: "GET", path: "/members", summary: "List members of the active organization" })
    .input(PaginationQuerySchema.and(TenantHeaderSchema))
    .output(MemberListResponseSchema),
  updateMember: oc
    .route({ method: "PATCH", path: "/members/:userId", summary: "Change an organization member role" })
    .input(MemberUserIdParamSchema.and(UpdateMemberSchema).and(TenantHeaderSchema))
    .output(MemberResponseSchema),
  removeMember: oc
    .route({ method: "DELETE", path: "/members/:userId", summary: "Remove a member from the active organization" })
    .input(MemberUserIdParamSchema.and(TenantHeaderSchema))
    .output(z.undefined().or(z.null()).or(z.void())),
  inviteMember: oc
    .route({ method: "POST", path: "/invitations", summary: "Invite a user to the active organization" })
    .input(InviteMemberSchema.and(TenantHeaderSchema))
    .output(InvitationResponseSchema),
  listInvitations: oc
    .route({ method: "GET", path: "/invitations", summary: "List invitations for the active organization" })
    .input(PaginationQuerySchema.and(TenantHeaderSchema))
    .output(InvitationListResponseSchema),
  acceptInvitation: oc
    .route({ method: "POST", path: "/invitations/accept", summary: "Accept an organization invitation" })
    .input(AcceptInvitationSchema)
    .output(MemberResponseSchema),
});

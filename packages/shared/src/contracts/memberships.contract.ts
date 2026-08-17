import { initContract, type AppRouter } from "@ts-rest/core";
import {
  AcceptInvitationSchema,
  InvitationListResponseSchema,
  InvitationResponseSchema,
  InviteMemberSchema,
  MemberListResponseSchema,
  MemberResponseSchema,
  MessageResponseSchema,
  PaginationQuerySchema,
  TenantHeaderSchema,
  UpdateMemberSchema,
  MemberUserIdParamSchema,
} from "../schemas";
import { contractSchema } from "./contract-schema";

const c = initContract();

export const membershipRoutes = {
  listMembers: {
    method: "GET" as const,
    path: "/tenancy/members",
    headers: contractSchema(TenantHeaderSchema),
    query: contractSchema(PaginationQuerySchema),
    responses: { 200: contractSchema(MemberListResponseSchema) },
    summary: "List members of the active organization",
  },
  updateMember: {
    method: "PATCH" as const,
    path: "/tenancy/members/:userId",
    pathParams: contractSchema(MemberUserIdParamSchema),
    headers: contractSchema(TenantHeaderSchema),
    body: contractSchema(UpdateMemberSchema),
    responses: {
      200: contractSchema(MemberResponseSchema),
      403: contractSchema(MessageResponseSchema),
      404: contractSchema(MessageResponseSchema),
    },
    summary: "Change an organization member role",
  },
  removeMember: {
    method: "DELETE" as const,
    path: "/tenancy/members/:userId",
    pathParams: contractSchema(MemberUserIdParamSchema),
    headers: contractSchema(TenantHeaderSchema),
    responses: {
      204: c.noBody(),
      403: contractSchema(MessageResponseSchema),
      404: contractSchema(MessageResponseSchema),
    },
    summary: "Remove a member from the active organization",
  },
  inviteMember: {
    method: "POST" as const,
    path: "/tenancy/invitations",
    headers: contractSchema(TenantHeaderSchema),
    body: contractSchema(InviteMemberSchema),
    responses: {
      201: contractSchema(InvitationResponseSchema),
      409: contractSchema(MessageResponseSchema),
    },
    summary: "Invite a user to the active organization",
  },
  listInvitations: {
    method: "GET" as const,
    path: "/tenancy/invitations",
    headers: contractSchema(TenantHeaderSchema),
    query: contractSchema(PaginationQuerySchema),
    responses: { 200: contractSchema(InvitationListResponseSchema) },
    summary: "List invitations for the active organization",
  },
  acceptInvitation: {
    method: "POST" as const,
    path: "/tenancy/invitations/accept",
    body: contractSchema(AcceptInvitationSchema),
    responses: {
      200: contractSchema(MemberResponseSchema),
      401: contractSchema(MessageResponseSchema),
      409: contractSchema(MessageResponseSchema),
    },
    summary: "Accept an organization invitation",
  },
} as const satisfies AppRouter;

import type {
  AcceptInvitationInput,
  InvitationListResponse,
  InvitationResponse,
  InviteMemberInput,
  MemberListResponse,
  MemberResponse,
  PaginationQuery,
  UpdateMemberInput,
} from "@repo/contracts";
import {
  EmptyResponseSchema,
  InvitationListResponseSchema,
  InvitationResponseSchema,
  MemberListResponseSchema,
  MemberResponseSchema,
} from "@repo/contracts";
import type { FetchFn } from "../types";
import { orpcResponse, type OrpcClient } from "../orpc";
import { normalizePagination } from "../utils";

export function createMembershipClient(
  fetchFn: FetchFn,
  orpc: OrpcClient | undefined,
  getTenantId: (() => string | null) | undefined,
) {
  const tenantHeaders = () => ({ "x-tenant-id": getTenantId?.() ?? "" });
  const pagination = (query?: PaginationQuery): PaginationQuery => normalizePagination(query);
  return {
    listMembers: (req: { query?: PaginationQuery } = {}) => {
      if (orpc && getTenantId?.()) {
        return orpcResponse(
          () =>
            orpc.memberships.listMembers({
              query: pagination(req.query),
              headers: tenantHeaders(),
            }),
          200,
          MemberListResponseSchema,
        );
      }
      return fetchFn<MemberListResponse>(
        `/tenancy/members${queryString(req.query)}`,
        {},
        MemberListResponseSchema,
      );
    },
    updateMember: (req: { params: { userId: string }; body: UpdateMemberInput }) =>
      orpc && getTenantId?.()
        ? orpcResponse(
            () =>
              orpc.memberships.updateMember({
                params: req.params,
                body: req.body,
                headers: tenantHeaders(),
              }),
            200,
            MemberResponseSchema,
          )
        : fetchFn<MemberResponse>(
            `/tenancy/members/${encodeURIComponent(req.params.userId)}`,
            { method: "PATCH", body: JSON.stringify(req.body) },
            MemberResponseSchema,
          ),
    removeMember: (req: { params: { userId: string } }) =>
      orpc && getTenantId?.()
        ? orpcResponse(
            () => orpc.memberships.removeMember({ params: req.params, headers: tenantHeaders() }),
            204,
            EmptyResponseSchema,
          )
        : fetchFn<void>(`/tenancy/members/${encodeURIComponent(req.params.userId)}`, {
            method: "DELETE",
          }),
    inviteMember: (req: { body: InviteMemberInput }) =>
      orpc && getTenantId?.()
        ? orpcResponse(
            () => orpc.memberships.inviteMember({ body: req.body, headers: tenantHeaders() }),
            201,
            InvitationResponseSchema,
          )
        : fetchFn<InvitationResponse>(
            "/tenancy/invitations",
            { method: "POST", body: JSON.stringify(req.body) },
            InvitationResponseSchema,
          ),
    listInvitations: (req: { query?: PaginationQuery } = {}) => {
      if (orpc && getTenantId?.()) {
        return orpcResponse(
          () =>
            orpc.memberships.listInvitations({
              query: pagination(req.query),
              headers: tenantHeaders(),
            }),
          200,
          InvitationListResponseSchema,
        );
      }
      return fetchFn<InvitationListResponse>(
        `/tenancy/invitations${queryString(req.query)}`,
        {},
        InvitationListResponseSchema,
      );
    },
    acceptInvitation: (req: { body: AcceptInvitationInput }) =>
      orpc
        ? orpcResponse(() => orpc.memberships.acceptInvitation(req.body), 200, MemberResponseSchema)
        : fetchFn<MemberResponse>(
            "/tenancy/invitations/accept",
            { method: "POST", body: JSON.stringify(req.body) },
            MemberResponseSchema,
          ),
  };
}

function queryString(query?: PaginationQuery): string {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  const value = params.toString();
  return value ? `?${value}` : "";
}

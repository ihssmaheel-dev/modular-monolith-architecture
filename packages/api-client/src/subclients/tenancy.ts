import type {
  AcceptInvitationInput,
  CreateOrganizationInput,
  InvitationListResponse,
  InvitationResponse,
  InviteMemberInput,
  MemberListResponse,
  MemberResponse,
  OrganizationListResponse,
  OrganizationResponse,
  PaginationQuery,
  TenantStatusResponse,
  UpdateMemberInput,
} from "@repo/contracts";
import type { FetchFn } from "../types";
import { orpcResponse, type OrpcClient } from "../orpc";

export function createTenancyClient(
  fetchFn: FetchFn,
  orpc?: OrpcClient,
  getTenantId?: () => string | null,
) {
  return {
    status: () =>
      orpc
        ? orpcResponse(() => orpc.organizations.status(), 200)
        : fetchFn<TenantStatusResponse>("/tenancy/status"),
    createOrganization: (req: { body: CreateOrganizationInput }) =>
      orpc
        ? orpcResponse(() => orpc.organizations.createOrganization(req.body), 201)
        : fetchFn<OrganizationResponse>("/tenancy/organizations", {
            method: "POST",
            body: JSON.stringify(req.body),
          }),
    listOrganizations: (req: { query?: PaginationQuery } = {}) => {
      if (orpc) {
        return orpcResponse(
          () =>
            orpc.organizations.listOrganizations({
              page: req.query?.page,
              limit: req.query?.limit,
            }),
          200,
        );
      }
      const sp = new URLSearchParams();
      if (req.query?.page) sp.set("page", String(req.query.page));
      if (req.query?.limit) sp.set("limit", String(req.query.limit));
      const qs = sp.toString();
      return fetchFn<OrganizationListResponse>(`/tenancy/organizations${qs ? `?${qs}` : ""}`);
    },
    listMembers: (req: { query?: PaginationQuery } = {}) => {
      if (orpc && getTenantId?.()) {
        return orpcResponse(
          () =>
            orpc.memberships.listMembers({
              query: { page: req.query?.page, limit: req.query?.limit },
              headers: { "x-tenant-id": getTenantId()! },
            }),
          200,
        );
      }
      const sp = new URLSearchParams();
      if (req.query?.page) sp.set("page", String(req.query.page));
      if (req.query?.limit) sp.set("limit", String(req.query.limit));
      const qs = sp.toString();
      return fetchFn<MemberListResponse>(`/tenancy/members${qs ? `?${qs}` : ""}`);
    },
    updateMember: (req: { params: { userId: string }; body: UpdateMemberInput }) =>
      orpc && getTenantId?.()
        ? orpcResponse(
            () =>
              orpc.memberships.updateMember({
                params: { userId: req.params.userId },
                body: req.body,
                headers: { "x-tenant-id": getTenantId()! },
              }),
            200,
          )
        : fetchFn<MemberResponse>(`/tenancy/members/${encodeURIComponent(req.params.userId)}`, {
            method: "PATCH",
            body: JSON.stringify(req.body),
          }),
    removeMember: (req: { params: { userId: string } }) =>
      orpc && getTenantId?.()
        ? orpcResponse(
            () =>
              orpc.memberships.removeMember({
                params: { userId: req.params.userId },
                headers: { "x-tenant-id": getTenantId()! },
              }),
            204,
          )
        : fetchFn<void>(`/tenancy/members/${encodeURIComponent(req.params.userId)}`, {
            method: "DELETE",
          }),
    inviteMember: (req: { body: InviteMemberInput }) =>
      orpc && getTenantId?.()
        ? orpcResponse(
            () =>
              orpc.memberships.inviteMember({
                body: req.body,
                headers: { "x-tenant-id": getTenantId()! },
              }),
            201,
          )
        : fetchFn<InvitationResponse>("/tenancy/invitations", {
            method: "POST",
            body: JSON.stringify(req.body),
          }),
    listInvitations: (req: { query?: PaginationQuery } = {}) => {
      if (orpc && getTenantId?.()) {
        return orpcResponse(
          () =>
            orpc.memberships.listInvitations({
              query: { page: req.query?.page, limit: req.query?.limit },
              headers: { "x-tenant-id": getTenantId()! },
            }),
          200,
        );
      }
      const sp = new URLSearchParams();
      if (req.query?.page) sp.set("page", String(req.query.page));
      if (req.query?.limit) sp.set("limit", String(req.query.limit));
      const qs = sp.toString();
      return fetchFn<InvitationListResponse>(`/tenancy/invitations${qs ? `?${qs}` : ""}`);
    },
    acceptInvitation: (req: { body: AcceptInvitationInput }) =>
      orpc
        ? orpcResponse(() => orpc.memberships.acceptInvitation(req.body), 200)
        : fetchFn<MemberResponse>("/tenancy/invitations/accept", {
            method: "POST",
            body: JSON.stringify(req.body),
          }),
  };
}

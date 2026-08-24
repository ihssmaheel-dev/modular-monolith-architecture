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
} from "@repo/shared";
import type { FetchFn } from "../types";

export function createTenancyClient(fetchFn: FetchFn) {
  return {
    status: () => fetchFn<TenantStatusResponse>("/tenancy/status"),
    createOrganization: (req: { body: CreateOrganizationInput }) =>
      fetchFn<OrganizationResponse>("/tenancy/organizations", {
        method: "POST",
        body: JSON.stringify(req.body),
      }),
    listOrganizations: (req: { query?: PaginationQuery } = {}) => {
      const sp = new URLSearchParams();
      if (req.query?.page) sp.set("page", String(req.query.page));
      if (req.query?.limit) sp.set("limit", String(req.query.limit));
      const qs = sp.toString();
      return fetchFn<OrganizationListResponse>(`/tenancy/organizations${qs ? `?${qs}` : ""}`);
    },
    listMembers: (req: { query?: PaginationQuery } = {}) => {
      const sp = new URLSearchParams();
      if (req.query?.page) sp.set("page", String(req.query.page));
      if (req.query?.limit) sp.set("limit", String(req.query.limit));
      const qs = sp.toString();
      return fetchFn<MemberListResponse>(`/tenancy/members${qs ? `?${qs}` : ""}`);
    },
    updateMember: (req: { params: { userId: string }; body: UpdateMemberInput }) =>
      fetchFn<MemberResponse>(`/tenancy/members/${encodeURIComponent(req.params.userId)}`, {
        method: "PATCH",
        body: JSON.stringify(req.body),
      }),
    removeMember: (req: { params: { userId: string } }) =>
      fetchFn<void>(`/tenancy/members/${encodeURIComponent(req.params.userId)}`, {
        method: "DELETE",
      }),
    inviteMember: (req: { body: InviteMemberInput }) =>
      fetchFn<InvitationResponse>("/tenancy/invitations", {
        method: "POST",
        body: JSON.stringify(req.body),
      }),
    listInvitations: (req: { query?: PaginationQuery } = {}) => {
      const sp = new URLSearchParams();
      if (req.query?.page) sp.set("page", String(req.query.page));
      if (req.query?.limit) sp.set("limit", String(req.query.limit));
      const qs = sp.toString();
      return fetchFn<InvitationListResponse>(`/tenancy/invitations${qs ? `?${qs}` : ""}`);
    },
    acceptInvitation: (req: { body: AcceptInvitationInput }) =>
      fetchFn<MemberResponse>("/tenancy/invitations/accept", {
        method: "POST",
        body: JSON.stringify(req.body),
      }),
  };
}

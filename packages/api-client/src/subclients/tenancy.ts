import type {
  CreateOrganizationInput,
  OrganizationListResponse,
  OrganizationResponse,
  PaginationQuery,
  TenantStatusResponse,
} from "@repo/contracts";
import {
  OrganizationListResponseSchema,
  OrganizationResponseSchema,
  TenantStatusResponseSchema,
} from "@repo/contracts";
import type { FetchFn } from "../types";
import { orpcResponse, type OrpcClient } from "../orpc";
import { createMembershipClient } from "./tenancy-members";
import { normalizePagination } from "../utils";

export function createTenancyClient(
  fetchFn: FetchFn,
  orpc?: OrpcClient,
  getTenantId?: () => string | null,
) {
  return {
    status: () =>
      orpc
        ? orpcResponse(() => orpc.organizations.status(), 200, TenantStatusResponseSchema)
        : fetchFn<TenantStatusResponse>("/tenancy/status", {}, TenantStatusResponseSchema),
    createOrganization: (req: { body: CreateOrganizationInput }) =>
      orpc
        ? orpcResponse(
            () => orpc.organizations.createOrganization(req.body),
            201,
            OrganizationResponseSchema,
          )
        : fetchFn<OrganizationResponse>(
            "/tenancy/organizations",
            {
              method: "POST",
              body: JSON.stringify(req.body),
            },
            OrganizationResponseSchema,
          ),
    listOrganizations: (req: { query?: PaginationQuery } = {}) => {
      if (orpc) {
        return orpcResponse(
          () => orpc.organizations.listOrganizations(normalizePagination(req.query)),
          200,
          OrganizationListResponseSchema,
        );
      }
      const sp = new URLSearchParams();
      if (req.query?.page) sp.set("page", String(req.query.page));
      if (req.query?.limit) sp.set("limit", String(req.query.limit));
      const qs = sp.toString();
      return fetchFn<OrganizationListResponse>(
        `/tenancy/organizations${qs ? `?${qs}` : ""}`,
        {},
        OrganizationListResponseSchema,
      );
    },
    ...createMembershipClient(fetchFn, orpc, getTenantId),
  };
}

import { oc } from "@orpc/contract";
import {
  CreateOrganizationSchema,
  OrganizationListResponseSchema,
  OrganizationResponseSchema,
  PaginationQuerySchema,
  TenantStatusResponseSchema,
} from "../schemas";

export const organizationsContract = oc.prefix("/tenancy").router({
  status: oc
    .route({ method: "GET", path: "/status", summary: "Get the configured tenancy mode" })
    .output(TenantStatusResponseSchema),
  createOrganization: oc
    .route({
      method: "POST",
      path: "/organizations",
      summary: "Create an organization and owner membership",
    })
    .input(CreateOrganizationSchema)
    .output(OrganizationResponseSchema),
  listOrganizations: oc
    .route({
      method: "GET",
      path: "/organizations",
      summary: "List organizations for the authenticated user",
    })
    .input(PaginationQuerySchema)
    .output(OrganizationListResponseSchema),
});

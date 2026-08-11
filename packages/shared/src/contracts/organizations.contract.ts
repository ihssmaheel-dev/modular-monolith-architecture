import { type AppRouter } from "@ts-rest/core";
import {
  CreateOrganizationSchema,
  MessageResponseSchema,
  OrganizationListResponseSchema,
  OrganizationResponseSchema,
  PaginationQuerySchema,
  TenantStatusResponseSchema,
} from "../schemas";
import { contractSchema } from "./contract-schema";

export const organizationRoutes = {
  status: {
    method: "GET" as const,
    path: "/tenancy/status",
    responses: { 200: contractSchema(TenantStatusResponseSchema) },
    summary: "Get the configured tenancy mode",
  },
  createOrganization: {
    method: "POST" as const,
    path: "/tenancy/organizations",
    body: contractSchema(CreateOrganizationSchema),
    responses: {
      201: contractSchema(OrganizationResponseSchema),
      409: contractSchema(MessageResponseSchema),
    },
    summary: "Create an organization and owner membership",
  },
  listOrganizations: {
    method: "GET" as const,
    path: "/tenancy/organizations",
    query: contractSchema(PaginationQuerySchema),
    responses: { 200: contractSchema(OrganizationListResponseSchema) },
    summary: "List organizations for the authenticated user",
  },
} as const satisfies AppRouter;

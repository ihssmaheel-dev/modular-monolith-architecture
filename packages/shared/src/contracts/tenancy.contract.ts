import { type AppRouter } from "@ts-rest/core";
import { membershipRoutes } from "./memberships.contract";
import { organizationRoutes } from "./organizations.contract";

export const tenancyContract = {
  ...organizationRoutes,
  ...membershipRoutes,
} as const satisfies AppRouter;

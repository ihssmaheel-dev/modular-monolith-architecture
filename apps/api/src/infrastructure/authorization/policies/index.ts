import { genericOwnershipPolicy } from "./ownership.policy";
import { genericTenantAdminPolicy } from "./tenant-admin.policy";
import type { Policy } from "@repo/authorization";

export { genericOwnershipPolicy } from "./ownership.policy";
export { genericTenantAdminPolicy } from "./tenant-admin.policy";

export const defaultFoundationalPolicies: Policy[] = [
  genericOwnershipPolicy,
  genericTenantAdminPolicy,
];

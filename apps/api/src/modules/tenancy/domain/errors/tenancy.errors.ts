export type TenancyError =
  | { type: "ORGANIZATION_SLUG_TAKEN" }
  | { type: "TENANT_REQUIRED" }
  | { type: "MEMBERSHIP_NOT_FOUND" }
  | { type: "MEMBERSHIP_ALREADY_EXISTS" }
  | { type: "INVITATION_ALREADY_EXISTS" }
  | { type: "INVITATION_INVALID" }
  | { type: "INVITATION_EMAIL_MISMATCH" }
  | { type: "TENANT_FORBIDDEN" }
  | { type: "LAST_OWNER" }
  | { type: "TENANCY_OPERATION_FAILED" };

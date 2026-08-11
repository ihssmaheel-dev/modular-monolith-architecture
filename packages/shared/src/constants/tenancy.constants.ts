export const TENANCY_MODES = ["single", "multi"] as const;
export const TENANT_ROLES = ["owner", "admin", "member"] as const;
export const INVITABLE_TENANT_ROLES = ["admin", "member"] as const;
export const TENANT_HEADER = "x-tenant-id";
export const INVITATION_TOKEN_BYTES = 32;
export const INVITATION_TTL_DAYS = 7;
export const MILLISECONDS_PER_DAY = 86_400_000;

export const Permissions = {
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  USERS_DELETE: "users:delete",
  ORDERS_READ: "orders:read",
  ORDERS_WRITE: "orders:write",
  NOTES_READ: "notes:read",
  NOTES_WRITE: "notes:write",
  FILES_READ: "files:read",
  FILES_WRITE: "files:write",
  FILES_DELETE: "files:delete",
  ORGANIZATIONS_READ: "organizations:read",
  ORGANIZATIONS_WRITE: "organizations:write",
  MEMBERS_READ: "members:read",
  MEMBERS_WRITE: "members:write",
  INVITATIONS_READ: "invitations:read",
  INVITATIONS_WRITE: "invitations:write",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export const RolePermissions: Record<string, Permission[]> = {
  admin: Object.values(Permissions),
  user: [
    Permissions.NOTES_READ,
    Permissions.NOTES_WRITE,
    Permissions.FILES_READ,
    Permissions.FILES_WRITE,
  ],
};

export const TenantRolePermissions: Record<string, Permission[]> = {
  owner: Object.values(Permissions),
  admin: [
    Permissions.ORGANIZATIONS_READ,
    Permissions.ORGANIZATIONS_WRITE,
    Permissions.MEMBERS_READ,
    Permissions.MEMBERS_WRITE,
    Permissions.INVITATIONS_READ,
    Permissions.INVITATIONS_WRITE,
    Permissions.NOTES_READ,
    Permissions.NOTES_WRITE,
    Permissions.FILES_READ,
    Permissions.FILES_WRITE,
    Permissions.FILES_DELETE,
  ],
  member: [
    Permissions.ORGANIZATIONS_READ,
    Permissions.MEMBERS_READ,
    Permissions.NOTES_READ,
    Permissions.NOTES_WRITE,
    Permissions.FILES_READ,
    Permissions.FILES_WRITE,
  ],
};

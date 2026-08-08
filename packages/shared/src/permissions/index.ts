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
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export const RolePermissions: Record<string, Permission[]> = {
  admin: Object.values(Permissions),
  user: [
    Permissions.USERS_READ,
    Permissions.NOTES_READ,
    Permissions.NOTES_WRITE,
    Permissions.FILES_READ,
    Permissions.FILES_WRITE,
  ],
};

export const Permissions = {
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  USERS_DELETE: "users:delete",
  ORDERS_READ: "orders:read",
  ORDERS_WRITE: "orders:write",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export const RolePermissions: Record<string, Permission[]> = {
  admin: Object.values(Permissions),
  user: [Permissions.USERS_READ, Permissions.ORDERS_READ, Permissions.ORDERS_WRITE],
};

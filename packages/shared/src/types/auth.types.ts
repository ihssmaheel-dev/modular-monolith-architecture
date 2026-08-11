import type { UserRole } from "./user.types";

export interface AuthenticatedUser {
  sub: string;
  email: string;
  name?: string;
  role: UserRole;
}

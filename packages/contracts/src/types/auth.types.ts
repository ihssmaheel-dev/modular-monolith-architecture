import type { UserRole } from "./user.types";

export interface AuthenticatedUser {
  sub: string;
  email: string;
  name?: string;
  role: UserRole;
  /** Monotonic account version used to revoke issued access tokens. */
  authVersion?: number;
}

import type { TenantRole } from "@repo/contracts";

export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Organization {
  private constructor(public readonly data: OrganizationData) {}

  static fromPersistence(data: OrganizationData): Organization {
    return new Organization(data);
  }
}

export interface MembershipData {
  id: string;
  tenantId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: TenantRole;
  createdAt: Date;
  updatedAt: Date;
}

export class Membership {
  private constructor(public readonly data: MembershipData) {}

  static fromPersistence(data: MembershipData): Membership {
    return new Membership(data);
  }
}

export interface InvitationData {
  id: string;
  tenantId: string;
  email: string;
  role: Exclude<TenantRole, "owner">;
  status: "pending" | "accepted" | "revoked";
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Invitation {
  private constructor(public readonly data: InvitationData) {}

  static fromPersistence(data: InvitationData): Invitation {
    return new Invitation(data);
  }
}

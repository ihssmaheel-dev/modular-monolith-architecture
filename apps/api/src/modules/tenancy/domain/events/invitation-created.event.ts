import type { Locale, TenantRole } from "@repo/shared";

export class InvitationCreatedEvent {
  constructor(
    public readonly tenantId: string,
    public readonly organizationName: string,
    public readonly email: string,
    public readonly role: Exclude<TenantRole, "owner">,
    public readonly token: string,
    public readonly locale: Locale,
  ) {}
}

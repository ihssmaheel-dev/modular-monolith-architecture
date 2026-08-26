import { randomBytes, createHash } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { err, ok, type Result } from "neverthrow";
import { INVITATION_TOKEN_BYTES, INVITATION_TTL_DAYS, MILLISECONDS_PER_DAY, type AuthenticatedUser, type InviteMemberInput } from "@repo/contracts";
import { type Locale } from "@repo/i18n";
import { TenantContextService } from "../../../../infrastructure/database";
import type { Invitation } from "../../domain/entities/tenancy.entity";
import type { TenancyError } from "../../domain/errors/tenancy.errors";
import { InvitationCreatedEvent } from "../../domain/events/invitation-created.event";
import { InvitationsRepository } from "../../infrastructure/invitations.repository";
import { MembershipsRepository } from "../../infrastructure/memberships.repository";
import { OrganizationsRepository } from "../../infrastructure/organizations.repository";

@Injectable()
export class InviteMemberCommand {
  constructor(
    private readonly invitations: InvitationsRepository,
    private readonly memberships: MembershipsRepository,
    private readonly organizations: OrganizationsRepository,
    private readonly context: TenantContextService,
    private readonly events: EventEmitter2,
  ) {}

  async execute(
    input: InviteMemberInput,
    actor: AuthenticatedUser,
    locale: Locale,
  ): Promise<Result<Invitation, TenancyError>> {
    const tenant = this.context.get();
    if (!tenant.tenantId) return err({ type: "TENANT_REQUIRED" });
    if (tenant.role !== "owner" && tenant.role !== "admin") {
      return err({ type: "TENANT_FORBIDDEN" });
    }

    const email = input.email.toLowerCase();
    const existingMember = await this.memberships.findByEmail(tenant.tenantId, email);
    if (existingMember.isErr()) return err({ type: "TENANCY_OPERATION_FAILED" });
    if (existingMember.value) {
      return err({ type: "MEMBERSHIP_ALREADY_EXISTS" });
    }
    await this.invitations.revokeExpired(tenant.tenantId, email);
    const pendingInvitation = await this.invitations.findPending(tenant.tenantId, email);
    if (pendingInvitation.isErr()) return err({ type: "TENANCY_OPERATION_FAILED" });
    if (pendingInvitation.value) {
      return err({ type: "INVITATION_ALREADY_EXISTS" });
    }

    const organization = await this.organizations.findById(tenant.tenantId);
    if (organization.isErr()) return err({ type: "TENANCY_OPERATION_FAILED" });
    if (!organization.value) return err({ type: "TENANT_REQUIRED" });
    const token = randomBytes(INVITATION_TOKEN_BYTES).toString("base64url");
    const result = await this.invitations.create({
      tenantId: tenant.tenantId,
      email,
      role: input.role,
      tokenHash: hashToken(token),
      invitedBy: actor.sub,
      status: "pending",
      expiresAt: new Date(Date.now() + INVITATION_TTL_DAYS * MILLISECONDS_PER_DAY),
    });
    if (result.isErr()) return err({ type: "TENANCY_OPERATION_FAILED" });
    this.events.emit(
      "tenancy.invitation.created",
      new InvitationCreatedEvent(
        tenant.tenantId,
        organization.value.data.name,
        email,
        input.role,
        token,
        locale,
      ),
    );
    return ok(result.value);
  }
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function hashToken(token: string): string {
  return hashInvitationToken(token);
}

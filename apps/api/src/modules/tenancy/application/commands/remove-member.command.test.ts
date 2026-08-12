import { beforeEach, describe, expect, it, vi } from "vitest";
import { err, ok } from "neverthrow";

import { TenantContextService } from "../../../../infrastructure/database";
import { Membership } from "../../domain/entities/tenancy.entity";
import { MembershipsRepository } from "../../infrastructure/memberships.repository";
import { RemoveMemberCommand } from "./remove-member.command";

describe("RemoveMemberCommand", () => {
  let command: RemoveMemberCommand;
  let memberships: MembershipsRepository;
  let context: TenantContextService;

  beforeEach(() => {
    memberships = {
      findMembership: vi.fn(),
      countOwners: vi.fn(),
      remove: vi.fn(),
    } as unknown as MembershipsRepository;
    context = {
      get: vi.fn().mockReturnValue({ tenantId: "org-1", role: "admin" }),
    } as unknown as TenantContextService;
    command = new RemoveMemberCommand(memberships, context);
  });

  it("requires an active tenant", async () => {
    vi.mocked(context.get).mockReturnValue({ mode: "multi" });

    const result = await command.execute("user-2");

    expect(result).toMatchObject({ error: { type: "TENANT_REQUIRED" } });
  });

  it("prevents an admin from removing an owner", async () => {
    vi.mocked(memberships.findMembership).mockResolvedValue(ok(member("owner")));

    const result = await command.execute("user-2");

    expect(result).toMatchObject({ error: { type: "TENANT_FORBIDDEN" } });
    expect(memberships.remove).not.toHaveBeenCalled();
  });

  it("prevents removal of the last owner", async () => {
    vi.mocked(context.get).mockReturnValue({ mode: "multi", tenantId: "org-1", role: "owner" });
    vi.mocked(memberships.findMembership).mockResolvedValue(ok(member("owner")));
    vi.mocked(memberships.countOwners).mockResolvedValue(ok(1));

    const result = await command.execute("user-2");

    expect(result).toMatchObject({ error: { type: "LAST_OWNER" } });
  });

  it("removes a member when the actor is authorized", async () => {
    vi.mocked(memberships.findMembership).mockResolvedValue(ok(member("member")));
    vi.mocked(memberships.remove).mockResolvedValue(ok(true));

    const result = await command.execute("user-2");

    expect(result.isOk()).toBe(true);
    expect(memberships.remove).toHaveBeenCalledWith("org-1", "user-2");
  });

  it("maps repository failures to a safe error", async () => {
    vi.mocked(memberships.findMembership).mockResolvedValue(err({ type: "CONFLICT" }) as never);

    const result = await command.execute("user-2");

    expect(result).toMatchObject({ error: { type: "TENANCY_OPERATION_FAILED" } });
  });
});

function member(role: "owner" | "admin" | "member"): Membership {
  return Membership.fromPersistence({
    id: "membership-2",
    tenantId: "org-1",
    userId: "user-2",
    userEmail: "member@example.com",
    userName: "Member",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

import { beforeEach, describe, expect, it, vi } from "vitest";

import { PinoLoggerService } from "../../../../infrastructure/logger/logger.service";
import { MembershipsRepository } from "../../infrastructure/memberships.repository";
import { MembershipUserListener } from "./membership-user.listener";

describe("MembershipUserListener", () => {
  let listener: MembershipUserListener;
  let memberships: MembershipsRepository;
  let logger: PinoLoggerService;

  beforeEach(() => {
    memberships = {
      updateUserSnapshot: vi.fn(),
      removeUser: vi.fn(),
    } as unknown as MembershipsRepository;
    logger = { error: vi.fn() } as unknown as PinoLoggerService;
    listener = new MembershipUserListener(memberships, logger);
  });

  it("updates membership snapshots after a user update", async () => {
    await listener.updateSnapshots({ userId: "user-1", changes: { email: "new@example.com" } });

    expect(memberships.updateUserSnapshot).toHaveBeenCalledWith("user-1", {
      email: "new@example.com",
    });
  });

  it("logs and contains snapshot failures", async () => {
    vi.mocked(memberships.updateUserSnapshot).mockRejectedValue(new Error("database unavailable"));

    await listener.updateSnapshots({ userId: "user-1", changes: { name: "New Name" } });

    expect(logger.error).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-1" }),
      "Membership snapshot update failed",
    );
  });

  it("removes memberships after a user deletion", async () => {
    await listener.removeMemberships({ userId: "user-1" });

    expect(memberships.removeUser).toHaveBeenCalledWith("user-1");
  });
});

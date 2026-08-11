import { describe, expect, it } from "vitest";
import { validateInvitationSearch } from "./invitation-search";

describe("validateInvitationSearch", () => {
  it("preserves an invitation token through authentication routes", () => {
    expect(validateInvitationSearch({ invitationToken: "secure-token" })).toEqual({
      invitationToken: "secure-token",
    });
  });

  it("rejects non-string redirect input", () => {
    expect(validateInvitationSearch({ invitationToken: ["unsafe"] })).toEqual({
      invitationToken: undefined,
    });
  });
});

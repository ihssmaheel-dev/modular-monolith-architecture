import { describe, it, expect, beforeEach } from "vitest";
import { ResetPasswordCommand } from "./reset-password.command";

describe("ResetPasswordCommand", () => {
  let command: ResetPasswordCommand;

  beforeEach(() => {
    command = new ResetPasswordCommand();
  });

  it("should return ok", async () => {
    // Act
    const result = await command.execute("some-token", "new-password");

    // Assert
    expect(result.isOk()).toBe(true);
  });
});

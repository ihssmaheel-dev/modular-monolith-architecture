import { describe, it, expect, vi, beforeEach } from "vitest";
import { ForgotPasswordCommand } from "./forgot-password.command";
import { GetUserByEmailQuery } from "../../../users/application/queries/get-user-by-email.query";
import { EmailService } from "../../../../infrastructure/email/email.service";
import { ok } from "neverthrow";
import { User } from "../../../users/domain/entities/user.entity";
import crypto from "crypto";

vi.mock("crypto", () => {
  const mockRandomBytes = vi.fn();
  return {
    default: {
      randomBytes: mockRandomBytes as any,
    },
    randomBytes: mockRandomBytes as any,
  };
});

describe("ForgotPasswordCommand", () => {
  let command: ForgotPasswordCommand;
  let getUserByEmail: GetUserByEmailQuery;
  let emailService: EmailService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    getUserByEmail = {
      execute: vi.fn(),
    } as unknown as GetUserByEmailQuery;
    
    emailService = {
      send: vi.fn(),
    } as unknown as EmailService;
    
    command = new ForgotPasswordCommand(getUserByEmail, emailService);
  });

  it("should return ok and NOT send email if user does not exist (prevent enumeration)", async () => {
    // Arrange
    vi.mocked(getUserByEmail.execute).mockResolvedValue(ok(null));

    // Act
    const result = await command.execute("nonexistent@example.com");

    // Assert
    expect(result.isOk()).toBe(true);
    expect(emailService.send).not.toHaveBeenCalled();
  });



  it("should send reset email and return ok if user exists", async () => {
    // Arrange
    const user = User.fromPersistence({ id: "123", email: "test@example.com", name: "Test", role: "user", createdAt: new Date(), updatedAt: new Date() });
    vi.mocked(getUserByEmail.execute).mockResolvedValue(ok(user));
    vi.mocked(crypto.randomBytes).mockReturnValue(Buffer.from("mocktokenbytes") as any);
    vi.mocked(emailService.send).mockResolvedValue(ok(undefined as any));

    // Act
    const result = await command.execute("test@example.com");

    // Assert
    expect(result.isOk()).toBe(true);
    expect(emailService.send).toHaveBeenCalledWith({
      to: "test@example.com",
      subject: "Password Reset Request",
      html: expect.stringContaining("6d6f636b746f6b656e6279746573"), // hex of "mocktokenbytes"
    });
  });
});

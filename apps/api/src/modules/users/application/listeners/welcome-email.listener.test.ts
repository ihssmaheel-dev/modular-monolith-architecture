import { describe, it, expect, vi, beforeEach } from "vitest";
import { WelcomeEmailListener } from "./welcome-email.listener";
import { PinoLoggerService } from "../../../../infrastructure/logger/logger.service";
import { UserCreatedEvent } from "../../domain/events/user.events";

describe("WelcomeEmailListener", () => {
  let listener: WelcomeEmailListener;
  let logger: PinoLoggerService;

  beforeEach(() => {
    logger = {
      info: vi.fn(),
    } as unknown as PinoLoggerService;
    
    listener = new WelcomeEmailListener(logger);
  });

  it("should log info when user.created event is received", () => {
    // Arrange
    const event = new UserCreatedEvent("user-123", "test@example.com", "Test");

    // Act
    listener.handle(event);

    // Assert
    expect(logger.info).toHaveBeenCalledWith(
      { userId: "user-123", email: "test@example.com" },
      "User created — welcome email queued"
    );
  });
});

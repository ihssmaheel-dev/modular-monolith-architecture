import { describe, it, expect, vi, beforeEach } from "vitest";
import { WelcomeEmailListener } from "./welcome-email.listener";
import { UserCreatedEvent } from "../../domain/events/user.events";
import { PinoLoggerService } from "../../../../infrastructure/logger/logger.service";
import { QueueService } from "../../../../infrastructure/queue/queue.service";

describe("WelcomeEmailListener", () => {
  let listener: WelcomeEmailListener;
  let logger: PinoLoggerService;
  let queueService: QueueService;
  let queue: any;

  beforeEach(() => {
    logger = {
      info: vi.fn(),
    } as unknown as PinoLoggerService;

    queue = {
      add: vi.fn().mockResolvedValue(undefined),
    };
    queueService = {
      getQueue: vi.fn().mockReturnValue(queue),
    } as unknown as QueueService;

    listener = new WelcomeEmailListener(logger, queueService);
  });

  it("should log info when user.created event is received", async () => {
    // Arrange
    const event = new UserCreatedEvent("user-123", "test@example.com", "Test");

    // Act
    await listener.handle(event);

    // Assert
    expect(logger.info).toHaveBeenCalledWith(
      { userId: "user-123", email: "test@example.com" },
      "User created — queuing welcome email via BullMQ",
    );
    expect(queueService.getQueue).toHaveBeenCalledWith("email");
    expect(queue.add).toHaveBeenCalledWith("welcome", { to: "test@example.com", name: "Test", html: expect.any(String) });
  });
});

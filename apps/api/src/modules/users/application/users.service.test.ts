import { describe, it, expect, vi, beforeEach } from "vitest";
import { UsersService } from "./users.service";
import { UsersRepository } from "../infrastructure/users.repository";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { User } from "../domain/entities/user.entity";
import { ok } from "neverthrow";

describe("UsersService", () => {
  let service: UsersService;
  let repository: UsersRepository;
  let eventEmitter: EventEmitter2;

  beforeEach(() => {
    repository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      model: {} as never,
      toDomain: {} as never,
    } as unknown as UsersRepository;

    eventEmitter = { emit: vi.fn() } as unknown as EventEmitter2;

    service = new UsersService(repository, eventEmitter);
  });

  describe("create", () => {
    it("should create a user when email is available", async () => {
      vi.mocked(repository.findByEmail).mockResolvedValue(ok(null));
      vi.mocked(repository.save).mockImplementation(async (user) => ok(user));

      const result = await service.create({ email: "test@example.com", name: "Test" });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.email).toBe("test@example.com");
      }
    });

    it("should return EMAIL_TAKEN when email exists", async () => {
      const existingUser = User.create({ email: "taken@example.com", name: "Taken" });
      vi.mocked(repository.findByEmail).mockResolvedValue(ok(existingUser));

      const result = await service.create({ email: "taken@example.com", name: "Test" });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe("EMAIL_TAKEN");
      }
    });
  });

  describe("getById", () => {
    it("should return user when found", async () => {
      const user = User.create({ email: "a@b.com", name: "A" });
      vi.mocked(repository.findById).mockResolvedValue(ok(user));

      const result = await service.getById("some-id");
      expect(result.isOk()).toBe(true);
    });

    it("should return USER_NOT_FOUND when not found", async () => {
      vi.mocked(repository.findById).mockResolvedValue(ok(null));

      const result = await service.getById("missing");
      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe("USER_NOT_FOUND");
      }
    });
  });
});

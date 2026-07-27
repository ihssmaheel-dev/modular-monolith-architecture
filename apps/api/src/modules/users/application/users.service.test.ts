import { describe, it, expect, vi, beforeEach } from "vitest";
import { UsersService } from "./users.service";
import { UsersRepository } from "../infrastructure/users.repository";
import { EventEmitter2 } from "@nestjs/event-emitter";

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
    } as any;

    eventEmitter = { emit: vi.fn() } as any;

    service = new UsersService(repository, eventEmitter);
  });

  describe("create", () => {
    it("should create a user when email is available", async () => {
      vi.mocked(repository.findByEmail).mockResolvedValue(null);
      vi.mocked(repository.save).mockImplementation(async (user: any) => user);

      const result = await service.create({ email: "test@example.com", name: "Test" });

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.email).toBe("test@example.com");
      }
    });

    it("should return EMAIL_TAKEN when email exists", async () => {
      vi.mocked(repository.findByEmail).mockResolvedValue({} as any);

      const result = await service.create({ email: "taken@example.com", name: "Test" });

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.type).toBe("EMAIL_TAKEN");
      }
    });
  });

  describe("getById", () => {
    it("should return user when found", async () => {
      vi.mocked(repository.findById).mockResolvedValue({
        isOk: () => true,
        value: { id: "123", email: "a@b.com", name: "A" },
      } as any);

      const result = await service.getById("123");
      expect(result.isOk()).toBe(true);
    });

    it("should return USER_NOT_FOUND when not found", async () => {
      vi.mocked(repository.findById).mockResolvedValue({
        isOk: () => true,
        value: null,
      } as any);

      const result = await service.getById("missing");
      expect(result.isErr()).toBe(true);
    });
  });
});

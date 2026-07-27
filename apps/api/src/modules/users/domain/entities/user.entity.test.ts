import { describe, it, expect } from "vitest";
import { User } from "./domain/entities/user.entity";

describe("User Entity", () => {
  it("should create a user with defaults", () => {
    const user = User.create({ email: "test@example.com", name: "Test" });

    expect(user.email).toBe("test@example.com");
    expect(user.name).toBe("Test");
    expect(user.role).toBe("user");
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it("should update fields", () => {
    const user = User.create({ email: "old@example.com", name: "Old" });
    user.update({ name: "New" });

    expect(user.name).toBe("New");
    expect(user.email).toBe("old@example.com");
  });

  it("should serialize to JSON", () => {
    const user = User.create({ email: "a@b.com", name: "A" });
    const json = user.toJSON();

    expect(json.email).toBe("a@b.com");
    expect(json).toHaveProperty("id");
    expect(json).toHaveProperty("createdAt");
  });
});

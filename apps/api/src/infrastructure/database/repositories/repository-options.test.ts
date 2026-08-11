import { describe, expect, it } from "vitest";
import { applySoftDelete } from "./repository-options";

describe("repository soft-delete options", () => {
  it("excludes deleted records by default", () => {
    expect(applySoftDelete({ status: "active" })).toEqual({
      status: "active",
      deletedAt: { $exists: false },
    });
  });

  it("preserves the filter when deleted records are included", () => {
    expect(applySoftDelete({ status: "active" }, { includeDeleted: true })).toEqual({
      status: "active",
    });
  });

  it("selects only deleted records when requested", () => {
    expect(applySoftDelete({}, { onlyDeleted: true })).toEqual({
      deletedAt: { $exists: true, $ne: null },
    });
  });
});

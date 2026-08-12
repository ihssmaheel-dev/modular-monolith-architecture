import { describe, expect, it } from "vitest";

import { getResponseMessage } from "./api-response";

describe("getResponseMessage", () => {
  it("returns a string response message", () => {
    expect(getResponseMessage({ message: "Request failed" })).toBe("Request failed");
  });

  it.each([null, "error", {}, { message: 42 }])("returns null for invalid values", (value) => {
    expect(getResponseMessage(value)).toBeNull();
  });
});

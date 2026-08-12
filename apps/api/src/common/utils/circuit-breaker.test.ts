import { describe, expect, it, vi } from "vitest";
import { err, ok } from "neverthrow";

import { CircuitBreaker } from "./circuit-breaker";

describe("CircuitBreaker", () => {
  it("opens after the configured number of failures and returns fallback", async () => {
    const onStateChange = vi.fn();
    const breaker = new CircuitBreaker(
      { failureThreshold: 2, resetTimeoutMs: 60_000, onStateChange },
      "UNAVAILABLE",
    );

    await breaker.execute(async () => err("FAILED"));
    await breaker.execute(async () => err("FAILED"));
    const result = await breaker.execute(async () => ok("unexpected"));

    expect(breaker.getState()).toBe("OPEN");
    expect(result).toMatchObject({ error: "UNAVAILABLE" });
    expect(onStateChange).toHaveBeenLastCalledWith("OPEN");
  });

  it("closes after a successful half-open request", async () => {
    vi.useFakeTimers();
    const breaker = new CircuitBreaker({ failureThreshold: 1, resetTimeoutMs: 100 }, "UNAVAILABLE");
    await breaker.execute(async () => err("FAILED"));
    vi.advanceTimersByTime(101);

    const result = await breaker.execute(async () => ok("recovered"));

    expect(result).toMatchObject({ value: "recovered" });
    expect(breaker.getState()).toBe("CLOSED");
    vi.useRealTimers();
  });
});

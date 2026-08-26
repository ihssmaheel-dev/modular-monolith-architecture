import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { FeatureFlagsService } from "./feature-flags.service";
import type { PinoLoggerService } from "../logger/logger.service";

describe("FeatureFlagsService", () => {
  let service: FeatureFlagsService;
  let mockLogger: PinoLoggerService;

  beforeEach(() => {
    mockLogger = {
      child: vi.fn().mockReturnThis(),
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as PinoLoggerService;

    service = new FeatureFlagsService(mockLogger);
  });

  afterEach(() => {
    delete process.env.FEATURE_FLAG_TEST_FLAG;
  });

  it("returns false for unknown flags by default", () => {
    expect(service.isEnabled("unknown_feature")).toBe(false);
  });

  it("respects in-memory overrides", () => {
    service.setFlag("beta_dashboard", true);
    expect(service.isEnabled("beta_dashboard")).toBe(true);

    service.setFlag("beta_dashboard", false);
    expect(service.isEnabled("beta_dashboard")).toBe(false);
  });

  it("reads from environment variables when no in-memory override exists", () => {
    process.env.FEATURE_FLAG_TEST_FLAG = "true";
    expect(service.isEnabled("test-flag")).toBe(true);

    process.env.FEATURE_FLAG_TEST_FLAG = "false";
    expect(service.isEnabled("test-flag")).toBe(false);
  });

  it("allows deleting in-memory overrides", () => {
    service.setFlag("temp_flag", true);
    expect(service.isEnabled("temp_flag")).toBe(true);

    service.deleteFlag("temp_flag");
    expect(service.isEnabled("temp_flag")).toBe(false);
  });

  it("returns all in-memory flags", () => {
    service.setFlag("flag_a", true);
    service.setFlag("flag_b", false);
    expect(service.getAllFlags()).toEqual({
      flag_a: true,
      flag_b: false,
    });
  });
});

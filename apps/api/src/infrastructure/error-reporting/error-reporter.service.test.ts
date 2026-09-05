import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorReporterService } from "./error-reporter.service";

const mockEnvironment = vi.hoisted(() => ({
  env: {
    NODE_ENV: "test",
    ERROR_REPORTING_URL: undefined as string | undefined,
    ERROR_REPORTING_TOKEN: undefined as string | undefined,
  },
}));

vi.mock("../../config/env", () => mockEnvironment);

describe("ErrorReporterService", () => {
  afterEach(() => {
    mockEnvironment.env.ERROR_REPORTING_URL = undefined;
    mockEnvironment.env.ERROR_REPORTING_TOKEN = undefined;
    vi.unstubAllGlobals();
  });

  it("uses structured application logs when no sink is configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { service } = createService();

    await service.capture(new Error("boom"), context());

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a provider-neutral report without request payloads", async () => {
    mockEnvironment.env.ERROR_REPORTING_URL = "https://telemetry.example.test/errors";
    mockEnvironment.env.ERROR_REPORTING_TOKEN = "t".repeat(16);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 202 });
    vi.stubGlobal("fetch", fetchMock);
    const { service } = createService();

    await service.capture(new Error("boom"), context());

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(fetchMock).toHaveBeenCalledWith(mockEnvironment.env.ERROR_REPORTING_URL, init);
    expect(init.headers).toMatchObject({
      "content-type": "application/json",
      authorization: `Bearer ${mockEnvironment.env.ERROR_REPORTING_TOKEN}`,
    });
    expect(JSON.parse(init.body as string)).toMatchObject({
      schemaVersion: 1,
      service: "api",
      error: { name: "Error", message: "boom" },
      context: context(),
    });
    expect(JSON.parse(init.body as string)).not.toHaveProperty("request.body");
  });

  it("contains sink failures and logs the delivery problem", async () => {
    mockEnvironment.env.ERROR_REPORTING_URL = "https://telemetry.example.test/errors";
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);
    const { service, logger } = createService();

    await expect(service.capture(new Error("boom"), context())).resolves.toBeUndefined();
    expect(logger.warn).toHaveBeenCalledWith({ error: "offline" }, "Error report delivery failed");
  });
});

function createService() {
  const logger = {
    child: vi.fn().mockReturnThis(),
    warn: vi.fn(),
  };
  return { service: new ErrorReporterService(logger as never), logger };
}

function context() {
  return { requestId: "request-1", method: "GET", path: "/api/v1/notes" };
}

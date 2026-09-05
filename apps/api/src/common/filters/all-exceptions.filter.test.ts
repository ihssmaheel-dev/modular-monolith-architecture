import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiErrorEnvelopeSchema } from "@repo/contracts";
import { AllExceptionsFilter } from "./all-exceptions.filter";
import { ZodValidationException } from "../exceptions/zod-validation.exception";
import { I18nService } from "../../infrastructure/i18n/i18n.service";
import { PinoLoggerService } from "../../infrastructure/logger/logger.service";

function createFilter() {
  const logger = { error: vi.fn() } as unknown as PinoLoggerService;
  const i18n = {
    t: vi.fn((key: string) => key),
  } as unknown as I18nService;
  return new AllExceptionsFilter(logger, i18n);
}

function host(url = "/api/v1/notes") {
  const response = {
    header: vi.fn(),
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  };
  const request = { url, headers: { "x-request-id": "request-1" } };
  return {
    response,
    value: {
      switchToHttp: () => ({ getResponse: () => response, getRequest: () => request }),
    },
  } as const;
}

describe("AllExceptionsFilter", () => {
  it("emits the same typed envelope for REST failures", () => {
    const filter = createFilter();
    const ctx = host();
    filter.catch(
      new BadRequestException({
        code: "NOTE_INVALID",
        i18nKey: "api.error.badRequest",
        fieldErrors: { title: ["api.error.badRequest"] },
      }),
      ctx.value as never,
    );
    const body = ctx.response.send.mock.calls[0]![0];
    expect(ApiErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    expect(body).toMatchObject({ code: "NOTE_INVALID", status: 400, requestId: "request-1" });
  });

  it("keeps the typed envelope inside the oRPC error transport", () => {
    const filter = createFilter();
    const ctx = host("/api/v1/rpc/notes/list");
    filter.catch(new BadRequestException(), ctx.value as never);
    const body = ctx.response.send.mock.calls[0]![0] as { data: unknown; requestId: string };
    expect(ApiErrorEnvelopeSchema.safeParse(body.data).success).toBe(true);
    expect(body.requestId).toBe("request-1");
  });

  it("localizes Zod field errors without exposing schema messages", () => {
    const filter = createFilter();
    const ctx = host();
    const parsed = z.object({ email: z.string().email() }).safeParse({ email: "bad" });
    if (parsed.success) throw new Error("test fixture unexpectedly passed");
    filter.catch(new ZodValidationException(parsed.error), ctx.value as never);
    const body = ctx.response.send.mock.calls[0]![0];
    expect(ApiErrorEnvelopeSchema.safeParse(body).success).toBe(true);
    expect(body).toMatchObject({
      code: "VALIDATION_FAILED",
      fieldErrors: { email: [expect.any(String)] },
    });
  });
});

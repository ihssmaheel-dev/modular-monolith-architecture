import { ExecutionContext, CallHandler } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";
import { firstValueFrom, of } from "rxjs";
import { z } from "zod";
import { ResponseValidationInterceptor } from "./response-validation.interceptor";
import { ResponseValidationException } from "../exceptions/response-validation.exception";
import { PinoLoggerService } from "../../infrastructure/logger/logger.service";

describe("ResponseValidationInterceptor", () => {
  const logger = {
    child: vi.fn().mockReturnThis(),
    error: vi.fn(),
  } as unknown as PinoLoggerService;

  it("parses a controller response with the shared schema", async () => {
    const context = {
      getType: vi.fn().mockReturnValue("http"),
      getHandler: vi.fn(),
      getClass: vi.fn(),
    } as unknown as ExecutionContext;
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(z.object({ id: z.string() })),
    } as unknown as Reflector;
    const interceptor = new ResponseValidationInterceptor(reflector, logger);
    const next = {
      handle: vi.fn().mockReturnValue(of({ id: "note-1", ignored: true })),
    } as CallHandler;
    await expect(firstValueFrom(interceptor.intercept(context, next))).resolves.toEqual({
      id: "note-1",
    });
  });

  it("fails closed when a controller violates its contract", async () => {
    const context = {
      getType: vi.fn().mockReturnValue("http"),
      getHandler: vi.fn(),
      getClass: vi.fn(),
    } as unknown as ExecutionContext;
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(z.object({ id: z.string() })),
    } as unknown as Reflector;
    const interceptor = new ResponseValidationInterceptor(reflector, logger);
    const next = { handle: vi.fn().mockReturnValue(of({ id: 42 })) } as CallHandler;
    await expect(firstValueFrom(interceptor.intercept(context, next))).rejects.toBeInstanceOf(
      ResponseValidationException,
    );
    expect(logger.error).toHaveBeenCalled();
  });
});

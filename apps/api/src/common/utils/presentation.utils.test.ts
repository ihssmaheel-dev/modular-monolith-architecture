import { describe, expect, it, vi } from "vitest";
import { HttpException, HttpStatus } from "@nestjs/common";
import { err, ok } from "neverthrow";

import { I18nService } from "../../infrastructure/i18n/i18n.service";
import { handleResult } from "./presentation.utils";

describe("handleResult", () => {
  const i18n = { t: vi.fn().mockReturnValue("Translated") } as unknown as I18nService;
  const errorMap = { NOT_FOUND: { status: HttpStatus.NOT_FOUND, i18nKey: "api.error.notFound" } };

  it("returns successful values", () => {
    expect(handleResult(ok("value"), errorMap, i18n)).toBe("value");
  });

  it("translates and maps a known domain error", () => {
    expect(() => handleResult(err({ type: "NOT_FOUND" }), errorMap, i18n, "es")).toThrow(
      HttpException,
    );
    expect(i18n.t).toHaveBeenCalledWith("api.error.notFound", "es");
  });

  it("uses the internal-error translation for an unmapped error", () => {
    expect(() => handleResult(err({ type: "UNEXPECTED" }), errorMap, i18n)).toThrow(HttpException);
    expect(i18n.t).toHaveBeenCalledWith("api.error.internal", undefined);
  });
});

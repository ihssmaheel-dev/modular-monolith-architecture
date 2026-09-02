import { HttpException, HttpStatus } from "@nestjs/common";
import type { ZodIssue } from "zod";

export class ResponseValidationException extends HttpException {
  readonly code = "RESPONSE_VALIDATION_FAILED";
  readonly i18nKey = "api.error.responseValidationFailed";
  readonly fieldErrors: Record<string, string[]>;

  constructor(issues: readonly ZodIssue[]) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of issues) {
      const path = issue.path.join(".") || "root";
      fieldErrors[path] ??= [];
      fieldErrors[path].push("api.error.responseValidationFailed");
    }
    super(
      {
        code: "RESPONSE_VALIDATION_FAILED",
        i18nKey: "api.error.responseValidationFailed",
        fieldErrors,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    this.fieldErrors = fieldErrors;
  }
}

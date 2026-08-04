import { HttpException, HttpStatus } from "@nestjs/common";
import { Result } from "neverthrow";
import { I18nService } from "../../infrastructure/i18n/i18n.service";

export interface ErrorMap {
  [errorType: string]: {
    status: HttpStatus;
    i18nKey: string;
  };
}

export function handleResult<T, E>(
  result: Result<T, E>,
  errorMap: ErrorMap,
  i18n: I18nService,
  lang?: string,
): T {
  if (result.isOk()) {
    return result.value;
  }

  const error = result.error as any;
  const errorType = error?.type;
  const mapped = errorType ? errorMap[errorType] : undefined;

  if (mapped) {
    throw new HttpException(
      {
        statusCode: mapped.status,
        message: i18n.t(mapped.i18nKey, lang),
        error: error.type,
      },
      mapped.status,
    );
  }

  // Fallback for unmapped errors
  throw new HttpException(
    {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: i18n.t("api.error.internal", lang),
      error: "INTERNAL_SERVER_ERROR",
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}

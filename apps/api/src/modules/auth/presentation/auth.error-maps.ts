import { HttpStatus } from "@nestjs/common";
import type { ErrorMap } from "../../../common/utils/presentation.utils";

export const EMAIL_TAKEN_ERRORS: ErrorMap = {
  EMAIL_TAKEN: { status: HttpStatus.CONFLICT, i18nKey: "auth.emailTaken" },
};

export const LOGIN_ERRORS: ErrorMap = {
  INVALID_CREDENTIALS: {
    status: HttpStatus.UNAUTHORIZED,
    i18nKey: "auth.invalidCredentials",
  },
  ACCOUNT_LOCKED: {
    status: HttpStatus.TOO_MANY_REQUESTS,
    i18nKey: "auth.accountLocked",
  },
};

export const INVALID_TOKEN_ERRORS: ErrorMap = {
  INVALID_TOKEN: { status: HttpStatus.UNAUTHORIZED, i18nKey: "auth.invalidToken" },
};

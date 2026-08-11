export type UserNotFound = { type: "USER_NOT_FOUND"; userId: string };
export type EmailTaken = { type: "EMAIL_TAKEN"; email: string };
export type InvalidUserData = { type: "INVALID_USER_DATA"; field: string; reason: string };
export type InvalidPasswordResetToken = { type: "INVALID_PASSWORD_RESET_TOKEN" };

export type UserError = UserNotFound | EmailTaken | InvalidUserData | InvalidPasswordResetToken;

export function formatUserError(error: UserError): string {
  switch (error.type) {
    case "USER_NOT_FOUND":
      return `User not found: ${error.userId}`;
    case "EMAIL_TAKEN":
      return `Email already taken: ${error.email}`;
    case "INVALID_USER_DATA":
      return `Invalid ${error.field}: ${error.reason}`;
    case "INVALID_PASSWORD_RESET_TOKEN":
      return "Invalid password reset token";
  }
}

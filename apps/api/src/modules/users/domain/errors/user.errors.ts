export type UserNotFound = { type: "USER_NOT_FOUND"; userId: string };
export type EmailTaken = { type: "EMAIL_TAKEN"; email: string };
export type InvalidUserData = { type: "INVALID_USER_DATA"; field: string; reason: string };

export type UserError = UserNotFound | EmailTaken | InvalidUserData;

export function formatUserError(error: UserError): string {
  switch (error.type) {
    case "USER_NOT_FOUND":
      return `User not found: ${error.userId}`;
    case "EMAIL_TAKEN":
      return `Email already taken: ${error.email}`;
    case "INVALID_USER_DATA":
      return `Invalid ${error.field}: ${error.reason}`;
  }
}

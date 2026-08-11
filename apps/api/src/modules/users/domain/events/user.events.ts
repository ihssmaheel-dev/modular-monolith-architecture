import { DEFAULT_LOCALE, type Locale } from "@repo/shared";

export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly locale: Locale = DEFAULT_LOCALE,
  ) {}
}

export class UserUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly changes: { email?: string; name?: string },
  ) {}
}

export class UserDeletedEvent {
  constructor(public readonly userId: string) {}
}

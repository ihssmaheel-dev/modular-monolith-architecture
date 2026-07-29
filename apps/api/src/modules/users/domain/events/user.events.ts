export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
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

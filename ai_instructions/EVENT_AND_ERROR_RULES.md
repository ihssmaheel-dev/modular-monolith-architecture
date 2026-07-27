# Event and Error Rules

Domain events mechanism and neverthrow Result pattern. Both are mandatory.

---

## Error Handling — neverthrow Result Pattern

We use `neverthrow` (`Result<T, E>` / `ResultAsync<T, E>`). No exceptions for expected failures.

### Rules

1. **Application and domain layers** return `Result` or `ResultAsync`.
2. **Controllers / presentation layer** translate `Result` into HTTP responses.
3. **Never throw** for expected domain or application failures.
4. **Throw only** for truly exceptional situations:
   - Programmer errors (null access, invalid state)
   - Unrecoverable infrastructure failures (database connection lost, disk full)
   - Anything that should never happen in correct code
5. **Partial adoption is forbidden.** This is the standard everywhere.

### Result Shape

Define domain errors as a union or enum:

```typescript
// modules/users/domain/errors/user.errors.ts
export type UserNotFound = { type: 'USER_NOT_FOUND'; userId: string };
export type EmailTaken = { type: 'EMAIL_TAKEN'; email: string };
export type InvalidUserData = { type: 'INVALID_USER_DATA'; field: string; reason: string };

export type UserError = UserNotFound | EmailTaken | InvalidUserData;
```

### Application Layer

```typescript
// modules/application/users.service.ts
import { Result, ResultAsync } from 'neverthrow';

async createUser(data: CreateUserInput): Promise<Result<User, UserError>> {
  const exists = await this.userRepository.findByEmail(data.email);
  if (exists) {
    return err({ type: 'EMAIL_TAKEN', email: data.email });
  }

  const user = User.create(data);
  await this.userRepository.save(user);
  return ok(user);
}
```

### Controller Layer

```typescript
// modules/presentation/users.controller.ts
async createUser(body: CreateUserDto) {
  const result = await this.userService.createUser(body);

  if (result.isErr()) {
    switch (result.error.type) {
      case 'EMAIL_TAKEN':
        return { status: 409, body: { message: 'Email already taken' } };
      case 'INVALID_USER_DATA':
        return { status: 400, body: { message: result.error.reason } };
      default:
        return { status: 500, body: { message: 'Internal error' } };
    }
  }

  return { status: 201, body: result.value };
}
```

### Error Mapping

| Error Category | HTTP Status | Example |
|----------------|-------------|---------|
| Validation / bad input | 400 | `INVALID_USER_DATA` |
| Not found | 404 | `USER_NOT_FOUND` |
| Conflict | 409 | `EMAIL_TAKEN` |
| Unauthorized | 401 | `UNAUTHORIZED` |
| Forbidden | 403 | `FORBIDDEN` |
| Infrastructure failure | 500 | Never expose internals to client |

---

## Domain Events

Two clear levels. No fuzzy hand-waving.

### Level 1: In-Process Events (Default)

- Use NestJS `EventEmitter2` or a tiny internal EventBus.
- For consistency inside the monolith.
- Example: `UserCreated` → welcome email listener.
- Synchronous or async in-process only.
- Defined as plain classes in `domain/events/`.

```typescript
// modules/users/domain/events/user-created.event.ts
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
  ) {}
}
```

```typescript
// modules/users/application/users.service.ts
async createUser(data: CreateUserInput): Promise<Result<User, UserError>> {
  // ... create user ...
  this.eventEmitter.emit('user.created', new UserCreatedEvent(user.id, user.email, user.name));
  return ok(user);
}
```

### Level 2: Reliable Async Work (BullMQ)

- When you need retries, persistence, backoff, or multi-instance safety.
- Application service publishes a job via BullMQ.
- Workers live in `infrastructure/queue/` or module-specific processors.

```typescript
// modules/users/application/users.service.ts
async createUser(data: CreateUserInput): Promise<Result<User, UserError>> {
  // ... create user ...
  await this.queue.add('send-welcome-email', { userId: user.id, email: user.email });
  return ok(user);
}
```

### Promotion Rule

**Prefer in-process events.** Promote to BullMQ only when reliability requirements demand it:
- Need retries with backoff
- Need persistence across restarts
- Need multi-instance safety
- Need delayed execution

---

## Event Naming

- Events are named as past-tense nouns: `UserCreated`, `OrderPlaced`, `PaymentFailed`.
- One event per meaningful domain state change.
- Events carry enough data for listeners to act without querying the database.

---

## Event Listeners

- One listener per event concern (welcome email, analytics, notifications).
- Listeners are idempotent — safe to replay.
- Listeners never throw. Catch and log.
- Listeners live in the same module or in `infrastructure/`.

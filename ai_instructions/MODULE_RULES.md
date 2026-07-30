# Module Rules

How to create and modify backend modules in `apps/api`.

---

## Mandatory Folder Structure

Every domain module **must** follow this exact structure:

```
modules/[domain]/
├── [domain].module.ts
├── presentation/
│   └── [domain].controller.ts
├── application/
│   ├── commands/
│   ├── queries/
│   └── listeners/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
└── infrastructure/
    ├── schemas/
    └── [domain].repository.ts
```

Do not skip folders. Do not add extra folders beyond this structure.

**Exception:** `listeners/` is allowed under `application/` because domain event handlers are a first-class pattern (see `EVENT_AND_ERROR_RULES.md`).

---

## Folder Responsibilities

### `presentation/`
- Controllers only.
- Extremely thin.
- Validate input via Zod / ts-rest.
- Call application commands/queries.
- Map `Result` → HTTP response.
- No business logic. No database access. No state.

### `application/`
- Business use cases (Commands and Queries).
- Orchestrates domain logic.
- Returns `Result<T, E>` or `ResultAsync<T, E>` from neverthrow.
- `commands/` for write operations (create, update, delete).
- `queries/` for read operations (list, getById, search).
- `listeners/` for domain event handlers (welcome email, analytics, notifications).
- Never directly accesses Mongoose. Goes through repository.

### Strict CQRS (Command Query Responsibility Segregation)

Every domain module **must** implement a strict CQRS architecture. We do not use flat services.

| Pattern | When to Use |
|---------|-------------|
| **commands/** | Isolated write operations (create, update, delete). |
| **queries/** | Isolated read operations (list, getById, search). |
| **listeners/** | Module emits domain events that trigger side effects. |

**There are absolutely no exceptions. Flat god-services are banned. Every use case gets its own class.**

### `domain/`
- Pure business rules. No framework dependencies.
- `entities/` — domain objects with identity.
- `value-objects/` — immutable domain objects without identity (Address, Money, DateRange).
- `events/` — domain event classes (plain classes, no framework).
- `errors/` — domain-specific error types.

### `infrastructure/`
- Domain-specific persistence and adapters only.
- `schemas/` — Mongoose schemas.
- `[domain].repository.ts` — data access implementation.
- Mappers between Mongoose documents and domain entities.
- External API adapters used by this domain only.
- Never contains business logic.

---

## Infrastructure Placement Rules

| Location | Responsibility |
|----------|----------------|
| `src/infrastructure/` | Cross-cutting: Redis connection, BullMQ root config, MinIO client, email transport, logger, mongoose connection |
| `modules/[domain]/infrastructure/` | Domain-specific: Mongoose schemas, repositories, mappers, external API adapters |

### Shared Infrastructure Modules

Cross-cutting infrastructure modules follow a simple structure:

```
src/infrastructure/redis/
├── redis.module.ts      ← NestJS @Module
└── redis.service.ts     ← Injectable service
```

Rules for shared infrastructure:
- Must be `@Global()` if used across multiple modules.
- Must use `env` from `config/env.ts` — never `process.env`.
- Must implement `OnModuleDestroy` for cleanup.
- No business logic. Pure technical concern.

Never put business logic in either infrastructure folder.

---

## Module Size Limits

| Metric | Limit | Action if Exceeded |
|--------|-------|-------------------|
| Module files | 25 | Split into sub-domains or extract a new module |
| Command/Query | 250 lines | Extract helper methods or split |
| Repository methods | 15 | Consider if the module is doing too much |

If a module exceeds these limits, ask: "Is this actually two modules?" Split by subdomain, not by technical layer.

---

## Module Registration

Every module must be registered in `app.module.ts` via NestJS module imports.

```typescript
@Module({
  imports: [UsersModule, AuthModule],
})
export class AppModule {}
```

---

## Creating a New Module

1. Create the folder structure above in `modules/[name]/`.
2. Define Zod schemas in `packages/shared/src/schemas/`.
3. Define ts-rest contract in `packages/shared/src/contracts/`.
4. Implement domain entities in `domain/entities/`.
5. Implement repository in `infrastructure/`.
6. Implement use-cases in `application/commands/` and `application/queries/`.
7. Implement controller in `presentation/`.
8. Register module, controllers, queries, and commands in `app.module.ts`.
9. Write tests at the correct layers.
10. Add migration if schema changes affect existing data.

---

## Controller Rules

- Validate input with Zod / ts-rest.
- Call exactly one application command/query per route.
- Map Result to HTTP:
  - `ok(value)` → 200/201 with value
  - `err(error)` → appropriate 4xx/5xx
- Never contain business logic.
- Never access database or repositories.
- Never modify state directly.
- Extract response mapping helpers (e.g., `toUserResponse()`) to avoid copy-paste.

---

## Cross-Module Communication

1. **Preferred:** Application command/query calls another module's command/query.
2. **Allowed:** Domain events (in-process via EventEmitter2).
3. **Never:** Direct import of another module's repository or Mongoose model.
4. **Never:** Shared mutable state between modules.

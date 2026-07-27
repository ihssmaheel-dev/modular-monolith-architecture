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
│   └── [domain].service.ts
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   └── errors/
└── infrastructure/
    ├── schemas/
    └── [domain].repository.ts
```

Do not skip folders. Do not merge folders. Do not add extra folders.

---

## Folder Responsibilities

### `presentation/`
- Controllers only.
- Extremely thin.
- Validate input via Zod / ts-rest.
- Call application services.
- Map `Result` → HTTP response.
- No business logic. No database access. No state.

### `application/`
- Business use cases / services.
- Orchestrates domain logic.
- Returns `Result<T, E>` or `ResultAsync<T, E>` from neverthrow.
- `commands/` for write operations.
- `queries/` for read operations.
- Never directly accesses Mongoose. Goes through repository.

### `domain/`
- Pure business rules. No framework dependencies.
- `entities/` — domain objects with identity.
- `value-objects/` — immutable domain objects without identity.
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

Never put business logic in either infrastructure folder.

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
6. Implement service in `application/`.
7. Implement controller in `presentation/`.
8. Register module in `app.module.ts`.
9. Write tests at the correct layers.
10. Add migration if schema changes affect existing data.

---

## Controller Rules

- Validate input with Zod / ts-rest.
- Call exactly one application service method per route.
- Map Result to HTTP:
  - `ok(value)` → 200/201 with value
  - `err(error)` → appropriate 4xx/5xx
- Never contain business logic.
- Never access database or repositories.
- Never modify state directly.

---

## Cross-Module Communication

1. **Preferred:** Application service calls another module's service.
2. **Allowed:** Domain events (in-process via EventEmitter2).
3. **Never:** Direct import of another module's repository or Mongoose model.
4. **Never:** Shared mutable state between modules.

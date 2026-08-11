# Creating a backend module

This guide uses an `orders` domain. Choose the domain boundary before creating files; do not split
one use case across arbitrary modules.

## 1. Generate the skeleton

```sh
pnpm generate:module orders
```

Names must be lowercase kebab-case. The generator refuses path traversal and existing modules. It
creates compilable placeholders in the mandatory layers:

```text
apps/api/src/modules/orders/
├── orders.module.ts
├── presentation/orders.controller.ts
├── application/commands/create-orders.command.ts
├── application/queries/get-orders.query.ts
├── domain/{entities,value-objects,events,errors}/
└── infrastructure/{schemas,orders.repository.ts}
```

The generator cannot infer business rules, public contracts, persistence fields, or indexes. The
module is not complete until the following steps are implemented.

## 2. Define the public API first

In `packages/shared` add:

- Zod input/output schemas under `src/schemas/`.
- Cross-application types under `src/types/`.
- A ts-rest contract under `src/contracts/`.
- Permissions under `src/permissions/`.
- Every user-facing translation key to all locale files.
- Explicit barrel exports for the new public definitions.

Never duplicate these definitions inside the API module.

## 3. Implement the domain

Add entities and value objects containing pure business behavior. Define expected failures as typed
error unions such as `{ type: "ORDER_NOT_FOUND" }`. Add past-tense domain events only for meaningful
state changes. Domain code must not import NestJS or Mongoose and must return neverthrow `Result`
instead of throwing expected failures.

## 4. Implement persistence

Add the Mongoose schema in `infrastructure/schemas/` and map documents to domain entities in the
repository. Choose ownership before writing queries:

- Global data extends `BaseRepository`.
- Tenant-owned data extends `TenantScopedRepository` and never queries `this.model` directly.

Import repository primitives only from `infrastructure/database`. Use lean reads, selected fields,
pagination, and batch operations. Create every query/sort/unique index through a timestamped file in
`migrations/`; indexes in schemas are prohibited.

## 5. Implement CQRS use cases

Create one command per write and one query per read. Application classes orchestrate repositories
and domain logic, return `Result<T, E>`, and never access Mongoose. Use the transactional outbox for
critical events that must commit with data.

Keep each class focused; do not replace commands and queries with a flat service.

## 6. Implement the controller

Use `@Controller()` with `@TsRestHandler()` from `@ts-rest/nest`. Each route calls exactly one command
or query and maps its `Result` through localized presentation error maps. Do not use `@Get`, `@Post`,
`@Body`, or `@Query`. Protect mutations with permissions and idempotency where required.

## 7. Wire the module

Register schemas with `MongooseModule.forFeature`, then list the controller, repository, commands,
queries, and listeners in `orders.module.ts`. Export commands/queries needed by another module, never
the Mongoose model or repository. Finally import `OrdersModule` in `apps/api/src/app.module.ts`.

Cross-module work calls another module's command/query or publishes an event; it never imports the
other module's repository.

## 8. Add tests and validate

- Unit-test domain behavior without NestJS or external services.
- Unit-test commands and queries with mocked repositories.
- Integration-test repositories against real MongoDB.
- E2E-test critical routes and authorization.

Run:

```sh
pnpm format
pnpm rules:check
pnpm lint
pnpm test:unit
pnpm test:integration
pnpm build
```

Before review, ask: “Is this the simplest structure that could work?” Confirm files are under 150
lines, functions under 30 lines, list endpoints are paginated, translations have locale parity, and
schema changes have reversible migrations.

# Architecture Explained

A plain-English guide to how this codebase works, why it's built this way, and how everything connects.

---

## The Big Picture

This is a **modular monolith** — one deployable backend, one database, but internally organized as if each domain (users, orders, payments) were its own isolated mini-application.

Everything lives in a **Turborepo monorepo** with three apps and shared packages:

```
┌─────────────────────────────────────────────────────────┐
│                      Turborepo                          │
│                                                         │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐           │
│   │ apps/api │   │ apps/web │   │ apps/mobile│          │
│   │ NestJS   │   │ React    │   │ Expo      │           │
│   └────┬─────┘   └────┬─────┘   └────┬─────┘           │
│        │              │              │                  │
│        └──────────────┼──────────────┘                  │
│                       │                                 │
│              ┌────────▼────────┐                        │
│              │ packages/shared │  ← everything starts   │
│              │ (Zod schemas)   │     here               │
│              └────────┬────────┘                        │
│                       │                                 │
│              ┌────────▼────────┐                        │
│              │ packages/       │                        │
│              │ api-client      │  ← typed SDK           │
│              └─────────────────┘                        │
└─────────────────────────────────────────────────────────┘
```

**One team. One deploy. One database. Zero microservices.**

---

## How a Feature Gets Built (End-to-End Flow)

Let's trace a "Create User" request from click to database:

### Step 1: Define the Contract (packages/shared)

```typescript
// packages/shared/src/schemas/user.schema.ts
export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8),
});

// packages/shared/src/contracts/users.contract.ts
export const usersContract = c.router({
  create: {
    method: "POST",
    path: "/users",
    body: CreateUserSchema,        // ← Zod validates the input
    responses: {
      201: UserResponseSchema,     // ← Zod defines the output
      409: c.type<{ message: string }>(),
    },
  },
});
```

**This single file is the source of truth.** Both the API and the client read from it. If the schema changes, TypeScript catches every place that breaks.

### Step 2: Implement the Backend (apps/api)

The request hits the controller, which is a thin adapter:

```
Request → Controller → Service → Repository → MongoDB
              │           │
              │           ├── Returns Result<User, UserError>
              │           └── Emits UserCreatedEvent
              │
              └── Maps Result → HTTP status + body
```

**The controller does almost nothing.** It validates via ts-rest, calls the specific Command or Query, and translates the Result into an HTTP response.

**The Application Command/Query contains the business logic.** It returns `Result<T, E>` — never throws for expected failures.

**The repository talks to MongoDB.** It's the only layer that touches Mongoose.

### Step 3: Consume from Frontend (apps/web or apps/mobile)

```typescript
// apps/web/src/lib/api.ts
import { createApiClient } from "@repo/api-client";
export const api = createApiClient("http://localhost:3000");

// apps/web/src/routes/index.tsx
const result = await api.users.create({
  body: { email: "a@b.com", name: "A", password: "secret123" },
});

if (result.status === 201) {
  // result.body is fully typed as UserResponse
}
```

**The same contract. The same types. The same validation. From database to UI.**

---

## The Module System (DDD)

Each domain is a self-contained module with this structure:

```
modules/users/
├── users.module.ts              ← NestJS module registration
├── presentation/                ← HTTP layer (thin)
│   └── users.controller.ts      ← Receives request, returns response
├── application/                 ← Business logic
│   ├── commands/                ← Write use-cases (e.g. create-user.command.ts)
│   ├── queries/                 ← Read use-cases (e.g. get-user.query.ts)
│   └── listeners/
│       └── welcome-email.listener.ts  ← Reacts to domain events
├── domain/                      ← Pure business rules (no framework)
│   ├── entities/
│   │   └── user.entity.ts       ← User class with behavior
│   ├── events/
│   │   └── user-created.event.ts ← What happened
│   └── errors/
│       └── user.errors.ts       ← Typed error union
└── infrastructure/              ← Persistence
    ├── schemas/
    │   └── user.mongoose.schema.ts  ← Mongoose schema
    └── users.repository.ts      ← Database operations
```

### Why This Structure?

| Layer | What it does | Can import from |
|-------|-------------|-----------------|
| `presentation` | HTTP in/out | `application` only |
| `application` | Use cases, orchestration | `domain`, `infrastructure` (repository interface) |
| `domain` | Business rules, entities | Nothing (pure TypeScript) |
| `infrastructure` | Database, external APIs | `domain` only |

**Domain is the center.** It has zero framework imports. This means you can test business rules without NestJS, without MongoDB, without anything.

**Modules never import each other's models.** If users needs orders, it calls the orders service through the application layer — never reaches into the orders repository directly.

---

## Type Safety End-to-End

This is the core promise of the architecture:

```
packages/shared/src/schemas/user.schema.ts     (Zod schema)
        │
        ├──→ packages/shared/src/contracts/     (ts-rest contract)
        │
        ├──→ apps/api controller                (validates request)
        │
        ├──→ packages/api-client                (typed client)
        │
        ├──→ apps/web                          (fully typed API calls)
        │
        └──→ apps/mobile                       (same typed API calls)
```

**One schema. One contract. TypeScript enforces it everywhere.**

If you change `CreateUserSchema` to add a required field, TypeScript immediately shows you every place that needs updating — the controller, the client, the web form, the mobile form.

---

## Error Handling (neverthrow)

We never throw for expected business failures. We return `Result<T, E>`:

```typescript
// CreateUserCommand returns Result
async execute(data: CreateUserInput): Promise<Result<User, EmailTaken>> {
  const existing = await this.repository.findByEmail(data.email);
  if (existing) return err({ type: "EMAIL_TAKEN", email: data.email });

  const user = User.create(data);
  const saved = await this.repository.save(user);
  return ok(saved);
}

// Controller translates Result → HTTP
const result = await this.createUserCommand.execute(body);
if (result.isErr()) {
  return { status: 409, body: { message: "Email already taken" } };
}
return { status: 201, body: result.value };
```

**Why?** Because exceptions are invisible control flow. `Result` makes errors explicit — you can see them in the type signature and the compiler forces you to handle them.

| Situation | What to do |
|-----------|-----------|
| Email already taken | Return `err({ type: "EMAIL_TAKEN" })` |
| User not found | Return `err({ type: "USER_NOT_FOUND" })` |
| Database connection lost | Throw (unrecoverable infrastructure failure) |
| Null pointer in correct code | Throw (programmer error) |

---

## Domain Events

When something important happens, the service emits an event:

```typescript
// Command emits event
this.eventEmitter.emit("user.created", new UserCreatedEvent(user.id, user.email, user.name));
```

Listeners react:

```typescript
@OnEvent("user.created")
handle(event: UserCreatedEvent) {
  // send welcome email, update analytics, etc.
}
```

**Two levels:**

| Level | Mechanism | When to use |
|-------|-----------|-------------|
| In-process | EventEmitter2 | Default. Fast, simple. |
| Reliable async | BullMQ | When you need retries, persistence, or multi-instance safety |

---

## Infrastructure Placement

Two `infrastructure/` folders with different responsibilities:

| Location | What goes here | Examples |
|----------|---------------|----------|
| `src/infrastructure/` | Cross-cutting tech shared by the whole app | Redis connection, BullMQ root config, MinIO client, logger, mongoose connection |
| `modules/[domain]/infrastructure/` | Domain-specific persistence | Mongoose schemas, repositories, mappers, external API adapters |

**Never put business logic in either.** Infrastructure is plumbing, not decisions.

---

## Environment Configuration

One rule: **`process.env` is only accessed in `config/env.ts`**.

```typescript
// config/env.ts — THE ONE PLACE
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().default(3000),
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
});

export const env = envSchema.parse(process.env);  // crashes immediately if invalid
```

Every other file imports `env` from here. No scattered `process.env` calls.

---

## Frontend Architecture

### Web (apps/web)

```
React 19 + Vite
    │
    ├── TanStack Router      ← type-safe routes
    ├── TanStack Query       ← server state (API data)
    ├── Zustand              ← client state (UI state)
    ├── shadcn/ui            ← components from packages/ui
    └── Tailwind             ← styling
```

**Rule:** All API calls go through `packages/api-client`. Never `fetch` directly.

### Mobile (apps/mobile)

```
Expo + Expo Router
    │
    ├── TanStack Query       ← same server state pattern
    ├── Zustand              ← same client state pattern
    └── NativeWind           ← Tailwind for React Native
```

**Rule:** Mobile never imports `packages/ui` (different primitives).

---

## Testing Strategy

| What you're testing | Where | How |
|--------------------|-------|-----|
| Business rules | `domain/` | Unit tests with Vitest. No NestJS, no database. |
| Use cases | `application/` | Unit tests. Mock the repository. |
| Database queries | `infrastructure/` | Integration tests with real MongoDB (Docker). |
| API endpoints | `presentation/` | E2E tests with Supertest. |
| User journeys | Full app | Playwright (web), Maestro (mobile). |

**The rule:** Test at the right level. Don't unit test the database. Don't E2E test a utility function.

---

## Key Patterns at a Glance

| Pattern | Where | Why |
|---------|-------|-----|
| **Zod schemas** | `packages/shared` | Single source of truth for validation |
| **ts-rest contracts** | `packages/shared` | Type-safe API contracts |
| **neverthrow Result** | `application/` + `domain/` | Explicit error handling |
| **Repository pattern** | `infrastructure/` | Isolate database from business logic |
| **Domain events** | `domain/events/` | Decoupled side effects |
| **Vertical slicing** | `modules/[domain]/` | Each domain is self-contained |
| **Env validation** | `config/env.ts` | Fail fast on bad config |

---

## When to Extract a Module

Stay monolith by default. Extract only when:
1. You have **measured** scaling pain (not imagined)
2. The module boundaries are already clean
3. The team is large enough to justify the operational cost

The module structure exists so extraction remains possible — not so you do it early.

---

**The architecture is deliberately simple.** If you're confused, something is wrong. Reread this document, check `ai_instructions/`, and ask "Is this the simplest structure that could work?"

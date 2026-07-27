# Architecture Document
### Modern Modular Monolith • Turborepo Monorepo

**Version:** 1.1  
**Status:** Stable  
**Stack:** Community / Free only  
**Target:** Small teams • Long-term maintainability • Thousands of users • AI-assisted development

---

## 1. Vision & Goals

We build full-stack **web + mobile** applications as a single, extremely modular monorepo.

### Goals
- Maximum long-term maintainability
- Extreme modularity without microservices
- Excellent DX for small teams
- End-to-end type safety
- AI-friendly, predictable structure
- 100% community / free stack
- Comfortable scaling to thousands of users
- **Under-engineered but never messy**

### Explicitly Rejected
- Microservices (until pain is real and measured)
- Over-engineering and unnecessary abstractions
- Paid core dependencies
- Multiple sources of truth
- Cross-module coupling
- Hand-wavy patterns with no concrete mechanism

---

## 2. High-Level Style

**Modular Monolith** inside a **Turborepo monorepo**.

Turborepo
├── apps/api → NestJS + Fastify (Modular Monolith)
├── apps/web → React + Vite
├── apps/mobile → Expo
└── packages/
├── shared → Zod schemas, types, constants, permissions, contracts
├── api-client → Typed client (consumed by web + mobile)
├── ui → Web-only components (shadcn/ui)
└── configs


---

## 3. Technology Stack (Community Only)

| Layer            | Choice                                      | Notes |
|------------------|---------------------------------------------|-------|
| Monorepo         | Turborepo + pnpm                            |       |
| Backend          | NestJS + Fastify                            |       |
| Validation       | Zod + nestjs-zod                            | Single source of truth |
| API Contract     | ts-rest                                     | Typed contracts shared across api + client |
| Database         | MongoDB + Mongoose                          |       |
| Migrations       | migrate-mongo                               | Explicit schema evolution |
| Cache & Queues   | Redis + BullMQ                              |       |
| Auth             | Better Auth (preferred) or pure JWT         | Open source |
| Web              | React 19 + Vite + TanStack Router + TanStack Query + shadcn/ui + Tailwind + Zustand | |
| Mobile           | Expo + Expo Router + NativeWind + Zustand   |       |
| Shared UI        | packages/ui (web only)                      | Not shared with mobile |
| Storage          | MinIO                                       | Self-hosted S3-compatible |
| Email            | Nodemailer                                  |       |
| Logging          | Pino                                        |       |
| Result type      | neverthrow                                  | Mandated |
| Testing          | Vitest + Supertest + Playwright + Maestro   |       |
| CI               | GitHub Actions                              |       |

---

## 4. Monorepo Structure

root/
├── apps/
│ ├── api/
│ ├── web/
│ └── mobile/
├── packages/
│ ├── shared/ # ★ Single source of truth
│ ├── api-client/ # Typed SDK for web + mobile
│ ├── ui/ # Web-only (shadcn/ui)
│ ├── eslint-config/
│ ├── typescript-config/
│ └── tailwind-config/
├── docker/ # MongoDB + Redis + MinIO
├── docs/
│ └── ARCHITECTURE.md
├── ai_instructions/              # AI-readable rules (start with README.md)
├── turbo.json
├── pnpm-workspace.yaml
└── package.json


---

## 5. Backend Architecture (`apps/api`)

### Top-level layout

apps/api/src/
├── main.ts
├── app.module.ts
├── config/
├── common/ # Guards, filters, interceptors, pipes, base classes
├── infrastructure/ # ★ Cross-cutting only (see rules below)
│ ├── redis/
│ ├── queue/ # BullMQ root config
│ ├── storage/ # MinIO
│ ├── email/
│ ├── logger/
│ └── database/ # Mongoose connection
└── modules/
├── auth/
├── users/
└── [domain]/


### Infrastructure placement rules (explicit)

| Location | Responsibility |
|----------|----------------|
| `src/infrastructure/` | Cross-cutting technical concerns shared by the whole app: Redis connection, BullMQ connection, MinIO client, email transport, logger, mongoose connection |
| `modules/[domain]/infrastructure/` | Domain-specific persistence and adapters only: Mongoose schemas, repositories, mappers, external API adapters used by that domain |

Never put business logic in either infrastructure folder.

### Module internal structure (mandatory)

modules/users/
├── users.module.ts
├── presentation/ # Controllers only (thin)
│ └── users.controller.ts
├── application/ # Use cases / services
│ ├── commands/
│ ├── queries/
│ └── users.service.ts
├── domain/ # Pure business rules
│ ├── entities/
│ ├── value-objects/
│ ├── events/ # Domain event classes
│ └── errors/
└── infrastructure/
├── schemas/ # Mongoose schemas
└── users.repository.ts


### Controllers
- Extremely thin
- Validate input via Zod / ts-rest
- Call application services
- Map Result → HTTP response
- No business logic

### Domain Events (concrete mechanism)

We use **two clear levels**:

1. **In-process domain events** (default)  
   - NestJS `EventEmitter2` (or a tiny internal EventBus)  
   - For consistency inside the monolith (e.g. `UserCreated` → welcome email listener)  
   - Synchronous or async in-process only  
   - Defined as classes in `domain/events/`

2. **Reliable async work**  
   - BullMQ  
   - When we need retries, persistence, backoff, or multi-instance safety  
   - Application service publishes a job; workers live in `infrastructure/queue` or module-specific processors

Rule: Prefer in-process events. Promote to BullMQ only when reliability requirements demand it.

---

## 6. packages/shared — Single Source of Truth

packages/shared/src/
├── schemas/ # All Zod schemas
├── contracts/ # ts-rest contract definitions
├── types/
├── constants/
├── permissions/
├── utils/
└── index.ts


Rules:
- Every DTO, query param, response shape, and form schema lives here
- Web, mobile, API, and api-client all consume from here
- No duplicated shapes anywhere else

---

## 7. API Contracts & api-client (concrete decision)

We use **ts-rest** (contract-first, Zod-native, fully free).

Flow:
1. Define contracts in `packages/shared/src/contracts/` (Zod schemas + routes + methods)
2. Implement the contract on NestJS (ts-rest Nest adapter)
3. `packages/api-client` exposes a typed client created from the same contract
4. `apps/web` and `apps/mobile` only talk to the backend through `api-client`

This eliminates hand-maintained clients and keeps type safety real, not aspirational.

No Orval/OpenAPI generation required unless we later expose public third-party APIs.

---

## 8. Error Handling — Result pattern (mandated)

We use **`neverthrow`** (`Result<T, E>` / `ok` / `err`).

Rules:
- Application and domain layers return `Result` (or `ResultAsync`)
- Controllers / presentation layer translate `Result` into HTTP responses
- Do not throw for expected domain/application failures
- Throw only for truly exceptional situations:
  - Programmer errors (null access, invalid state)
  - Unrecoverable infrastructure failures (database connection lost, disk full)
  - Anything that should never happen in correct code
- Partial adoption is forbidden — this is the standard

---

## 9. Frontend

### Web (`apps/web`)
- React 19 + Vite
- TanStack Router
- TanStack Query
- Zustand
- React Hook Form + Zod
- Tailwind + shadcn/ui via `packages/ui`

### Mobile (`apps/mobile`)
- Expo + Expo Router
- NativeWind
- TanStack Query
- Zustand
- Same Zod schemas and api-client

### packages/ui
- **Web-only**
- shadcn/ui components + design tokens
- Mobile does **not** import `packages/ui` (different primitives)
- Shared visual language (colors, spacing, radius) may live in `packages/shared` or tailwind-config if needed

---

## 10. Database & Migrations

- MongoDB + Mongoose
- All schemas live in module `infrastructure/schemas/`
- **Migrations are mandatory** for anything non-trivial via `migrate-mongo`
- Schema changes that affect existing data must have a migration
- Keep migrations small, forward-only when possible, and reviewed like code
- Index changes also belong in migrations

At thousands of users, untracked schema drift is unacceptable.

---

## 11. Testing Strategy (contract)

| Layer | Test type | Tools |
|-------|-----------|-------|
| `domain/` + `application/` | Unit tests | Vitest |
| `infrastructure/` (repositories, adapters) | Integration tests | Vitest + real Mongo/Redis (testcontainers or local docker) |
| `presentation/` + full flows | E2E / API tests | Supertest (API), Playwright (web), Maestro (mobile) |

Rules:
- Business rules must be unit-tested without NestJS or database
- Repositories must have integration tests
- Critical user journeys must have E2E coverage
- Prefer fewer, higher-value tests over noisy ones

---

## 12. Critical Rules (non-negotiable)

1. Zod + ts-rest contracts are the single source of truth  
2. Vertical domain modules with the mandatory internal structure  
3. No cross-module Mongoose model/repository imports  
4. Cross-cutting tech in root `infrastructure/`; domain persistence in module `infrastructure/`  
5. `neverthrow` Result pattern is mandatory in application/domain  
6. Domain events = in-process by default; BullMQ for reliable async  
7. `packages/ui` is web-only  
8. Every non-trivial schema change needs a migration  
9. Under-engineered but never messy  
10. No microservices until extraction pain is real and documented  

---

## 13. Scaling (thousands of users)

- Stateless API → horizontal scaling
- Redis for cache / rate limits / queues
- Proper MongoDB indexes + connection pooling
- BullMQ for heavy or retryable work
- CDN for web assets
- MinIO (or later S3-compatible) for files
- This stays simple and cheap at small-team scale

---

## 14. Development Workflow

1. Define/update Zod schemas + ts-rest contract in `packages/shared`
2. Implement/adjust backend module using the strict structure
3. Application layer returns `Result`
4. Wire controller via ts-rest
5. Consume through `packages/api-client` in web/mobile
6. Add unit/integration/E2E tests at the correct layer
7. Add migration if schema/data changes

---

## 15. Evolution Path

Stay a modular monolith by default.  

Extract a module to a separate service only when:
- There is measured pain (scaling, deploy isolation, team ownership), and
- Boundaries are already clean

Our structure exists so extraction remains possible — not so we do it early.

---

## 16. Why these decisions

- **ts-rest** → makes the type-safety promise real  
- **neverthrow** → consistent errors, no chaos  
- **Explicit event mechanism** → no fuzzy “domain events” hand-waving  
- **migrate-mongo** → schema evolution is intentional  
- **Clear infrastructure split** → no dumping ground  
- **Web-only ui package** → avoids false sharing with NativeWind  
- **Defined test contract** → quality without ceremony  
- **Under-engineered but never messy** → enforced by asking in every PR: "Is this the simplest structure that could work? Does it belong where I'm putting it?"

---

**This architecture is simple, strict, and built to stay clean for years.**
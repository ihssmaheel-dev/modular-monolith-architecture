# Production Architecture Baseline

This repository is a modular monolith with one deployable API and one web client. `TENANCY_MODE` is selected at deployment time as `single` or `multi`; client requests cannot change it.

## API and contracts

`@repo/contracts` is the schema source of truth. REST controllers are the compatibility transport and must validate input/output against those schemas. The oRPC contracts are used for generated clients and documentation; parity tests are required for every route.

## Request security pipeline

Request ID and trace context are established first, followed by origin/CSRF checks, authentication, tenant resolution, permission evaluation, resource policy evaluation, Zod validation, and the application command/query. Controllers contain no business logic.

## Modules

Each module owns its domain entities, application commands/queries, policies, events, persistence schema, repository, presentation adapter, error map, and tests. Cross-module database imports are prohibited.

## Tenancy

Single mode resolves a configured/default tenant context. Multi mode requires an authenticated membership for the requested tenant. Tenant-scoped repositories and PostgreSQL RLS provide defense in depth. System jobs must use an explicit system context and must be tested for cross-tenant isolation.

## Events and side effects

Critical events are written to the transactional outbox in the same database transaction as the state change. Events use stable IDs, versions, tenant IDs, actor IDs, correlation IDs, and causation IDs. Consumers are idempotent and dead-lettered events are replayable.

## Authentication

Access tokens are short-lived and validate issuer, audience, algorithm, account state, and revocation state. Refresh tokens rotate within families; reuse revokes the family/session. Signing keys are rotatable.

## Verification gate

Production changes require passing architecture rules, API/web typechecks, all package builds, unit/integration/contract/E2E tests, migration checks, security scans, dependency audit, and container/SBOM checks.

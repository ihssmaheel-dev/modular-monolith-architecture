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

Critical events are written to the transactional outbox in the same database transaction as the state change. Event payloads are versioned and carry stable domain/tenant identifiers; request IDs are logged for correlation. Integrations should add persisted actor, correlation, causation, and idempotency metadata to the event contract before publishing outside the process. Consumers are idempotent and dead-lettered events are replayable.

## Authentication

Access tokens are short-lived and validate issuer, audience, algorithm, and account version. Refresh tokens carry a unique `jti` and are single-use when Redis is available; reuse is rejected and logout increments the account version/revokes sessions. Signing-key rotation is an operational requirement: provision overlapping key verification (`kid`) before rotating secrets.

## Verification gate

Production changes require passing architecture rules, API/web typechecks, all package builds, unit/integration/contract/E2E tests, migration checks, security scans, dependency audit, and container/SBOM checks. The CI workflow is the enforcement point; local development should run the same commands before review.

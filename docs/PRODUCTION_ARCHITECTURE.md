# Production Architecture Baseline

This repository is a modular monolith with one deployable API and one web client. `TENANCY_MODE` is selected at deployment time as `single` or `multi`; client requests cannot change it.

## API and contracts

`@repo/contracts` is the schema source of truth and the oRPC contract registry. The Nest
`@orpc/nest` adapter serves the contracts as the runtime transport at `/api/rpc/*`; the typed
`@repo/api-client` uses this transport by default. Compatibility REST controllers remain at
`/api/*` and call the same application commands/queries. A route is complete only when its
contract, oRPC handler, REST compatibility mapping (where required), and transport parity smoke
test are present.

### oRPC request flow

```text
oRPC client → OpenAPI link → Nest @orpc/nest adapter → guards/interceptors
  → contract validation → application command/query → repository → database/outbox/audit
```

Authentication, tenant, locale, CSRF, and idempotency headers are injected by the shared client;
the same global Nest security pipeline protects both transports. oRPC errors use the stable API
error code and localized message envelope, while the REST surface remains a compatibility option
without a second business implementation.

## Request security pipeline

Request ID and trace context are established first, followed by origin/CSRF checks, authentication, tenant resolution, permission evaluation, resource policy evaluation, Zod validation, and the application command/query. Controllers contain no business logic.

## Modules

Each module owns its domain entities, application commands/queries, policies, events, persistence schema, repository, presentation adapter, error map, and tests. Cross-module database imports are prohibited.

## Tenancy

Single mode resolves a configured/default tenant context. Multi mode requires an authenticated membership for the requested tenant. Tenant-scoped repositories and PostgreSQL RLS provide defense in depth. System jobs must use an explicit system context and must be tested for cross-tenant isolation. Outbox writes make this distinction explicit: `dispatchTenant` derives a trusted tenant scope, while `dispatchGlobal` uses the internal transaction-local system scope. The system flag is not accepted in public tenant context or request data.

## Events and side effects

Critical events are written to the transactional outbox in the same database transaction as the state change. Event payloads are versioned and carry stable domain/tenant identifiers; request IDs are logged for correlation. Integrations should add persisted actor, correlation, causation, and idempotency metadata to the event contract before publishing outside the process. Consumers are idempotent and dead-lettered events are replayable.

## Authentication

Access tokens are short-lived and validate issuer, audience, algorithm, and account version. The protected web layout bootstraps against `GET /api/auth/me` before rendering application content, so persisted UI state is never treated as proof of a live session. Refresh tokens carry a unique `jti` and are single-use when Redis is available; reuse is rejected and logout/password reset increment the account version, revoke sessions, and disconnect realtime clients. Redis revocation fan-out ensures every API replica closes its local realtime connections. Signing-key rotation is an operational requirement: provision overlapping key verification (`kid`) before rotating secrets.

## Transaction boundaries

HTTP requests use a short transaction by default so PostgreSQL RLS context is always configured; long-lived or external-I/O handlers opt out with `@NoDatabaseTransaction` and create short explicit database scopes around their reads/writes. Commands own explicit `withResultTransaction` units of work. SMTP, S3 presigning/deletion, Redis, and other network calls are performed outside mutation transactions. PostgreSQL statement, lock, and idle-in-transaction timeouts are configured from validated environment variables.

## File lifecycle

Uploads are recorded as `pending`, confirmed as `uploading` quarantine records only after an S3 metadata check, and promoted to `uploaded` by the scheduled scanner. Failed or stale records are marked/removed by reconciliation workers. Deletion marks the database row first, then removes the object; retries reconcile deleted rows so an S3 failure cannot silently lose metadata. Per-user quotas and MIME/size contracts are enforced before presigning.

## Durable events and realtime

The outbox relay claims rows briefly, validates a versioned envelope, and publishes to the BullMQ `domain-events` queue before marking the row `PUBLISHED`. Queue consumers validate envelopes, use the outbox ID as an idempotent job ID, and retain failed jobs for inspection. Dead-letter rows can be replayed through `OutboxService.replayDeadLetter`. Realtime uses the stable logical group `realtime-dispatchers`, unique process consumer names, `XAUTOCLAIM` for abandoned deliveries, and a stream dead-letter key; failed or malformed messages are never acknowledged until retry exhaustion.

## Worker separation

Queue and scheduled workers are infrastructure providers so they can run in a dedicated worker deployment using the same AppModule and configuration, while the API process remains stateless. Production orchestration should scale API and worker replicas independently and expose queue depth, outbox age, retry, dead-letter, and realtime lag metrics.

## Verification gate

Production changes require passing architecture rules, API/web typechecks, all package builds, unit/integration/contract/E2E tests, migration checks, security scans, dependency audit, and container/SBOM checks. The CI workflow is the enforcement point; local development should run the same commands before review.

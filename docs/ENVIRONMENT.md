# Environment-variable reference

Local setup copies the committed examples to ignored `.env` files (`pnpm bootstrap` creates `apps/api/.env` and `apps/web/.env` if missing). Runtime API variables are validated by `packages/contracts/src/schemas/env.schema.ts`; web (`VITE_API_URL`) is validated locally via Zod in `apps/web/src/lib/env.ts`. Invalid production configuration stops startup. Never commit `.env` files or real credentials.

## Web (TanStack Start)

| Variable        | Default / purpose                                                                |
| --------------- | -------------------------------------------------------------------------------- |
| `VITE_API_URL`  | `http://localhost:3000/api`; browser → API base URL (must include `/api` prefix) |
| `VITE_APP_NAME` | `Workspace`; display name (optional)                                             |

Validated in `apps/web/src/lib/env.ts` (`z.string().url()`). Example in `apps/web/.env.example`.

## API core and connectivity

| Variable                            | Default / purpose                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `NODE_ENV`                          | `development`; one of `development`, `test`, `production`                      |
| `PROCESS_ROLE`                      | `all` locally; use `api` for HTTP-only or `worker` for queue/scheduled workers |
| `PORT`                              | `3000`; API listener port                                                      |
| `LOG_LEVEL`                         | `info`; Pino level from `fatal` through `trace`                                |
| `TENANCY_MODE`                      | `single`; choose `single` or `multi` before production data exists             |
| `CLIENT_URL`                        | `http://localhost:5173`; allowed browser origin                                |
| `API_URL`                           | `http://localhost:3000`; externally reachable API origin                       |
| `DATABASE_URL`                      | Local PostgreSQL connection string (e.g. `postgres://...`)                     |
| `DB_MAX_POOL_SIZE`                  | `10`; maximum PostgreSQL connections in pool                                   |
| `DB_STATEMENT_TIMEOUT_MS`           | `30000`; maximum statement duration                                            |
| `DB_LOCK_TIMEOUT_MS`                | `5000`; maximum lock wait duration                                             |
| `DB_IDLE_IN_TRANSACTION_TIMEOUT_MS` | `60000`; idle transaction guard                                                |
| `REDIS_URL`                         | `redis://localhost:6379` locally; required in production                       |
| `TEST_DATABASE_URL`                 | Integration/E2E database; its name must contain `test`                         |

## Authentication, security, and observability

| Variable                             | Default / purpose                                                  |
| ------------------------------------ | ------------------------------------------------------------------ |
| `JWT_SECRET`                         | Access-token secret, minimum 32 characters; replace in production  |
| `JWT_REFRESH_SECRET`                 | Separate refresh-token secret, minimum 32 characters               |
| `JWT_EXPIRES_IN`                     | `15m`; access-token lifetime                                       |
| `JWT_REFRESH_EXPIRES_IN`             | `7d`; refresh-token lifetime                                       |
| `METRICS_TOKEN`                      | Optional locally, minimum 32 characters and required in production |
| `RATE_LIMIT_MAX`                     | `100`; requests allowed per rate-limit window                      |
| `RATE_LIMIT_TTL`                     | `60`; rate-limit window in seconds                                 |
| `IDEMPOTENCY_TTL_SECONDS`            | `86400`; maximum lifetime of a completed idempotent response       |
| `IDEMPOTENCY_PROCESSING_TTL_SECONDS` | `300`; lease lifetime for in-flight idempotent requests            |
| `IDEMPOTENCY_STALE_AFTER_SECONDS`    | `60`; age after which an abandoned lease may be recovered          |
| `IDEMPOTENCY_MAX_RESPONSE_BYTES`     | `1048576`; maximum response size stored for replay                 |
| `LOCKOUT_MAX_ATTEMPTS`               | `5`; failed logins before account lockout                          |
| `LOCKOUT_DURATION_MINUTES`           | `15`; account-lockout duration                                     |
| `OTEL_EXPORTER_OTLP_ENDPOINT`        | `http://localhost:4318/v1/traces`; trace collector endpoint        |

## Storage and CDN

| Variable                | Default / purpose                                           |
| ----------------------- | ----------------------------------------------------------- |
| `STORAGE_DRIVER`        | `s3`                                                        |
| `S3_ENDPOINT`           | `http://localhost:9000`; local MinIO endpoint               |
| `S3_REGION`             | `us-east-1`                                                 |
| `S3_BUCKET`             | `uploads`                                                   |
| `S3_ACCESS_KEY_ID`      | `minioadmin` locally                                        |
| `S3_SECRET_ACCESS_KEY`  | `minioadmin` locally                                        |
| `S3_FORCE_PATH_STYLE`   | `true`; required by local MinIO                             |
| `FILE_USER_QUOTA_BYTES` | `104857600`; active upload quota per user                   |
| `FILE_AV_ENABLED`       | `false`; antivirus scan integration for quarantined uploads |
| `FILE_AV_URL`           | Optional scanner endpoint returning `{ "clean": boolean }`  |
| `CDN_ENABLED`           | `false`; enable CDN URL generation                          |
| `CDN_DOMAIN`            | Optional public CDN hostname, without protocol              |
| `CDN_BUCKET_PATH`       | `uploads`; public bucket path prefix                        |

## Email and seed

| Variable                  | Default / purpose                                      |
| ------------------------- | ------------------------------------------------------ |
| `EMAIL_DRIVER`            | `smtp`; choose `smtp` or `resend`                      |
| `EMAIL_FROM`              | `noreply@example.com`; validated sender address        |
| `SMTP_HOST`               | `localhost`; local Mailpit host                        |
| `SMTP_PORT`               | `1025`; local Mailpit SMTP port                        |
| `SMTP_USER` / `SMTP_PASS` | Optional SMTP credentials                              |
| `RESEND_API_KEY`          | Required only when `EMAIL_DRIVER=resend`               |
| `SEED_ADMIN_EMAIL`        | Optional one-time administrator email                  |
| `SEED_ADMIN_PASSWORD`     | Optional administrator password, minimum 12 characters |

Seed email and password must be configured together.

## Production Docker Compose

`docker/.env.prod.example` also defines `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `MINIO_USER`,
and `MINIO_PASSWORD` for container initialization. Generate unique production secrets; never reuse the committed local defaults.

When adding an API variable, update the shared Zod schema (`packages/contracts/src/schemas/env.schema.ts`), every applicable example, this reference,
and deployment configuration in the same change.

# Environment-variable reference

Local setup copies the committed examples to ignored `.env` files. Runtime API variables are
validated by `packages/shared/src/schemas/env.schema.ts`; invalid production configuration stops
startup. Never commit `.env` files or real credentials.

## API core and connectivity

| Variable                              | Default / purpose                                                  |
| ------------------------------------- | ------------------------------------------------------------------ |
| `NODE_ENV`                            | `development`; one of `development`, `test`, `production`          |
| `PORT`                                | `3000`; API listener port                                          |
| `LOG_LEVEL`                           | `info`; Pino level from `fatal` through `trace`                    |
| `TENANCY_MODE`                        | `single`; choose `single` or `multi` before production data exists |
| `CLIENT_URL`                          | `http://localhost:5173`; allowed browser origin                    |
| `API_URL`                             | `http://localhost:3000`; externally reachable API origin           |
| `MONGODB_URI`                         | Local authenticated MongoDB connection string                      |
| `MONGODB_MAX_POOL_SIZE`               | `10`; maximum Mongo connections                                    |
| `MONGODB_MIN_POOL_SIZE`               | `2`; minimum Mongo connections                                     |
| `MONGODB_SERVER_SELECTION_TIMEOUT_MS` | `5000`; initial/server selection timeout                           |
| `MONGODB_HEARTBEAT_FREQUENCY_MS`      | `10000`; Mongo topology heartbeat interval                         |
| `REDIS_URL`                           | `redis://localhost:6379` locally; required in production           |
| `TEST_MONGODB_URI`                    | Integration/E2E database; its name must contain `test`             |

## Authentication, security, and observability

| Variable                      | Default / purpose                                                  |
| ----------------------------- | ------------------------------------------------------------------ |
| `JWT_SECRET`                  | Access-token secret, minimum 32 characters; replace in production  |
| `JWT_REFRESH_SECRET`          | Separate refresh-token secret, minimum 32 characters               |
| `JWT_EXPIRES_IN`              | `15m`; access-token lifetime                                       |
| `JWT_REFRESH_EXPIRES_IN`      | `7d`; refresh-token lifetime                                       |
| `METRICS_TOKEN`               | Optional locally, minimum 32 characters and required in production |
| `RATE_LIMIT_MAX`              | `100`; requests allowed per rate-limit window                      |
| `RATE_LIMIT_TTL`              | `60`; rate-limit window in seconds                                 |
| `LOCKOUT_MAX_ATTEMPTS`        | `5`; failed logins before account lockout                          |
| `LOCKOUT_DURATION_MINUTES`    | `15`; account-lockout duration                                     |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4318/v1/traces`; trace collector endpoint        |

## Storage and CDN

| Variable               | Default / purpose                              |
| ---------------------- | ---------------------------------------------- |
| `STORAGE_DRIVER`       | `s3`; choose `s3` or `gridfs`                  |
| `S3_ENDPOINT`          | `http://localhost:9000`; local MinIO endpoint  |
| `S3_REGION`            | `us-east-1`                                    |
| `S3_BUCKET`            | `uploads`                                      |
| `S3_ACCESS_KEY_ID`     | `minioadmin` locally                           |
| `S3_SECRET_ACCESS_KEY` | `minioadmin` locally                           |
| `S3_FORCE_PATH_STYLE`  | `true`; required by local MinIO                |
| `CDN_ENABLED`          | `false`; enable CDN URL generation             |
| `CDN_DOMAIN`           | Optional public CDN hostname, without protocol |
| `CDN_BUCKET_PATH`      | `uploads`; public bucket path prefix           |

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

## Frontend applications

| File               | Variable                                        | Purpose               |
| ------------------ | ----------------------------------------------- | --------------------- |
| `apps/web/.env`    | `VITE_API_URL=/api`                             | Browser API base path |
| `apps/mobile/.env` | `EXPO_PUBLIC_API_URL=http://localhost:3000/api` | Device API URL        |

Physical devices cannot use the development computer's `localhost`; set the mobile URL to the
computer's LAN address and allow that origin/network as appropriate.

## Production Docker Compose

`docker/.env.prod.example` also defines `MONGO_USER`, `MONGO_PASSWORD`, `MONGO_DB`, `MINIO_USER`,
and `MINIO_PASSWORD` for container initialization. URL-encode database credentials embedded in
`MONGODB_URI`. Generate unique production secrets; never reuse the committed local defaults.

When adding an API variable, update the shared Zod schema, every applicable example, this reference,
and deployment configuration in the same change.

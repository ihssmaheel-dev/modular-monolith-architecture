# Security and Operations Rules

Environment variables, security, database indexes, logging, and git workflow.

---

## Environment Variables

### Rule
Every environment variable must be validated with Zod at startup. No `process.env.FOO` scattered in code.

### Implementation

Create `apps/api/src/config/env.ts` loading a strictly-typed schema:

```typescript
import { envSchema, type Env } from "@repo/shared";

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten().fieldErrors);
    process.exit(1);
  }

  return result.data;
}

export const env = loadEnv();
```

### Rules
- **Schema first**: Define all environment variables in `packages/shared/src/schemas/env.schema.ts`.
- **Provide safe defaults** for local development (e.g., `PORT: z.coerce.number().default(3000)`).
- **Never hardcode URLs or TTLs**: Dynamically consume `env.CLIENT_URL`, `env.API_URL`, and `env.JWT_EXPIRES_IN`.
- Validate once at startup, use `env` everywhere.
- Never access `process.env` directly outside `config/env.ts`.
- No secrets in code, no secrets in git, no `.env` in version control.

---

## Security

### Secrets
- Never commit secrets, API keys, or passwords.
- Never log secrets.
- Never expose secrets in error messages or API responses.
- Use `.env` for local dev. Use environment injection in CI/CD.
- Rotate secrets if they are ever exposed.

### Authentication
- Use pure JWT from the locked stack.
- Tokens expire. Short-lived access tokens + refresh tokens.
- Access tokens signed with `JWT_SECRET`, refresh tokens with separate `JWT_REFRESH_SECRET`.
- Store tokens in httpOnly cookies (not localStorage). Set `httpOnly: true`, `secure: true`, `sameSite: "strict"`.
- Auth guard reads tokens from both Bearer header and cookies.
- Logout clears cookies on the server via `POST /auth/logout`.
- Never store passwords in plaintext. Hash with argon2.
- Validate auth on every protected route via guard.
- Apply account lockout after configurable failed attempts (default: 5 attempts, 15-minute lockout).
- Use `SecurityModule` (global) for cross-cutting security concerns (rate limiting, WAF, session, lockout).

### Input
- Validate all input with Zod at the API boundary.
- Sanitize HTML output if rendering user content.
- No raw MongoDB queries from user input.
- Parameterized queries only. Never concatenate user input into queries.

### Authorization
- Check permissions at the application layer, not just the controller.
- Use the permission system in `packages/shared/src/permissions/`.
- Deny by default. Allow only what is explicitly permitted.

### Rate Limiting
- Apply rate limiting to public endpoints.
- Apply stricter limits to auth endpoints.
- Use Redis-backed rate limiting for multi-instance safety.

### CORS
- Configure CORS explicitly. Never use `origin: "*"` in production.
- Allowlist specific origins:
  ```typescript
  app.enableCors({
    origin: ["https://app.example.com", "https://admin.example.com"],
    credentials: true,
  });
  ```
- In development, allow `localhost` on standard ports.
- Use `OriginValidationInterceptor` as a defense-in-depth layer beyond CORS.

### Request Limits
- Set maximum request body size (e.g., 1MB for JSON, 10MB for file uploads).
- Set request timeouts (e.g., 30s for API, 60s for file operations).
- Configure at the Fastify adapter level:
  ```typescript
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 1048576, // 1MB
      trustProxy: true,
    }),
  );
  ```

---

## Database Indexing

### When to Add an Index
Add an index when:
- A field is used in `find()` queries frequently.
- A field is used in `sort()` or `order()` operations.
- A field is used in `where` / filter clauses.
- A compound query uses multiple fields together.

### Rules
- Every index must be defined in a migration (via `migrate-mongo`).
- Never add indexes directly in Mongoose schema without a migration.
- Use compound indexes for multi-field queries.
- Prefer sparse indexes for fields with many null values.
- Name indexes descriptively: `users_email_unique`, `orders_userId_createdAt`.

### Examples

```typescript
// Good: compound index for common query
collection.createIndex({ userId: 1, createdAt: -1 });

// Good: unique index
collection.createIndex({ email: 1 }, { unique: true });

// Good: sparse index for optional field
collection.createIndex({ deletedAt: 1 }, { sparse: true });
```

### Anti-Patterns
- No indexes on small collections (<1000 documents) unless growth is expected.
- No over-indexing. Every index slows writes.
- No unused indexes. Monitor with MongoDB profiler.

---

## Observability, Tracing, and Logging

### OpenTelemetry (Distributed Tracing)
- The monolithic backend exports distributed traces via the `TracingModule`.
- HTTP endpoints and Database queries are automatically instrumented.
- For extremely heavy backend workflows (like large batch processing), wrap the logic in a custom trace span using standard OpenTelemetry SDKs.

### Standard Application Logging
Tool: Pino (locked stack). Fast, structured, JSON output.

| Level | When | Example |
|-------|------|---------|
| `info` | Important application events | Order placed, payment received |
| `warn` | Recoverable issues | Rate limit hit, retry attempted, deprecated API used |
| `error` | Failures requiring attention | Database connection failed, external API error |
| `debug` | Development troubleshooting | Request/response details |

### Audit Logging (Compliance)
- **Do NOT** use Pino for compliance or security tracking (e.g., password changes, permission grants, data exports).
- Inject the `AuditService` and save structured audit logs directly to the database.
- Audit logs must be immutable and queryable by security teams.

### Rules
- Never log passwords, tokens, or secrets.
- Never log full request bodies for endpoints that handle sensitive data.
- Use structured logging: `logger.info({ userId, action }, "User created")`.
- Log with context: request ID, user ID, correlation ID.
- No `console.log` in production code. Use Pino.

---

## Git Workflow

### Commit Messages
Format: `type(scope): description`

Types:
- `feat` — new feature
- `fix` — bug fix
- `refactor` — code change that neither fixes a bug nor adds a feature
- `test` — adding or updating tests
- `docs` — documentation only
- `chore` — build, CI, dependencies
- `style` — formatting, no code change

Examples:
```
feat(users): add password reset flow
fix(auth): prevent token reuse after logout
refactor(orders): extract discount calculation
test(users): add integration tests for repository
chore: update dependencies
```

### Rules
- One logical change per commit.
- No WIP commits to main.
- Reference issue numbers when applicable: `fix(auth): handle expired token (#42)`.
- No generated files, build artifacts, or `.env` in commits.

### Branches
- `main` — production-ready, always deployable.
- `feat/[name]` — feature branches.
- `fix/[name]` — bug fix branches.
- Delete branches after merge.

### Pull Requests
- Title matches commit message format.
- Describe what changed and why.
- Link related issues.
- All tests pass.
- At least one review before merge (solo team: self-review checklist).
- No large PRs. Split if >400 lines changed.

---

## Quick Checklist Before Commit

- [ ] No secrets or env vars in code
- [ ] Input validated with Zod
- [ ] Errors return `Result`, not throw
- [ ] Error messages use `I18nService` (not hardcoded)
- [ ] User-facing text uses i18n keys
- [ ] New translation keys added to all locales
- [ ] Logs are structured with Pino
- [ ] New DB fields have indexes (via migration)
- [ ] Commit message follows `type(scope): description`
- [ ] File is under 150 lines
- [ ] No `any`, no magic numbers, no console.log

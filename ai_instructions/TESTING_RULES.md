# Testing Rules

Test contract for the codebase. Quality without ceremony.

---

## Test Layers

| Code Location | Test Type | Tool | What to Test |
|---------------|-----------|------|--------------|
| `domain/` | Unit | Vitest | Entities, value objects, business rules. Pure logic. |
| `application/` | Unit | Vitest | Use cases, service logic. Mock repository. |
| `infrastructure/` | Integration | Vitest + testcontainers or local Docker | Repositories, adapters. Real Mongo/Redis. |
| `presentation/` + full flows | E2E | Supertest (API), Playwright (web), Maestro (mobile) | API endpoints, user journeys. |

---

## Rules

### Unit Tests (domain + application)
- Run without NestJS, database, or network.
- Mock repository and external dependencies.
- Test business rules in isolation.
- Fast. Should complete in milliseconds.
- One test file per source file.

### Integration Tests (infrastructure)
- Use real MongoDB and Redis (via testcontainers or local docker).
- Test repository CRUD, query correctness, data mapping.
- Clean up data between tests.
- Run in CI with docker services.

### E2E Tests (presentation + flows)
- Test complete user journeys through the API.
- Use Supertest for API tests.
- Use Playwright for web browser tests.
- Use Maestro for mobile tests.
- Cover critical paths only: registration, login, core CRUD, payments.

---

## File Naming

```
users.service.test.ts          # Unit test for users.service.ts
users.repository.test.ts       # Integration test for users.repository.ts
users.controller.test.ts       # Unit test for users.controller.ts (mocked service)
users.e2e.test.ts              # E2E test for user-related API endpoints
```

Place test files next to the source file they test.

---

## Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('UsersService', () => {
  describe('createUser', () => {
    it('should create a user when email is available', async () => {
      // Arrange
      // Act
      // Assert
    });

    it('should return EMAIL_TAKEN when email already exists', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

- Use `describe` for the module/class.
- Use `describe` for the method.
- Use `it` for individual behavior.
- Each test has exactly one assertion concept.
- Arrange → Act → Assert pattern.

---

## What NOT to Test

- Framework internals (NestJS, Mongoose, React).
- Third-party library behavior.
- Trivial getters/setters.
- Type-only code.
- Configuration files.

---

## Coverage Expectations

- Domain layer: high coverage (this is the core).
- Application layer: high coverage.
- Infrastructure layer: medium coverage (integration tests matter more).
- Presentation layer: medium coverage (E2E tests matter more).
- Overall: aim for meaningful coverage, not percentage targets.

---

## CI Integration

- Unit tests run on every push.
- Integration tests run on every push (with docker services).
- E2E tests run on PRs and before merge.
- All tests must pass before merge.
- No skipped tests without a linked issue.

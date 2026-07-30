# Architecture Manifesto

Welcome to the ultimate SaaS Boilerplate. This codebase is built upon strict architectural principles designed for massive scale, effortless team collaboration, and extreme maintainability.

## 1. Modular Monolith
We deploy as a single, easily hosted Node.js process. However, internally, our codebase is split into **strictly isolated Modules**.
- `auth` does not know how `users` works.
- `users` does not know how `billing` works.
- Modules communicate exclusively through Application-layer Commands/Queries or Domain Events.
- **Never** directly import another module's Infrastructure Repository or Mongoose schema.

## 2. Clean Architecture (Ports and Adapters)
We strictly separate our codebase into 4 layers, enforcing the Dependency Rule (inner layers cannot know about outer layers):
1. **Domain:** Pure business logic. Entities, Value Objects, Domain Events. Zero framework dependencies.
2. **Application:** Orchestrates use cases. Interacts with Repositories. Emits Events.
3. **Infrastructure:** MongoDB schemas, Repositories, Redis drivers, Email clients.
4. **Presentation:** HTTP Controllers. Parses HTTP requests, calls Application, maps results to HTTP responses.

## 3. Strict CQRS (Command Query Responsibility Segregation)
We do not use monolithic "God Services". Every single use-case in this application is broken down into an isolated class:
- **Commands:** Mutate state (e.g., `CreateUserCommand`).
- **Queries:** Read state without mutating (e.g., `GetUserByIdQuery`).
- If your Controller handles registration, it explicitly injects `CreateUserCommand` and nothing else.
- **Rule:** Flat services are globally banned in the domain application layer.

## 4. Neverthrow (Railway Oriented Programming)
We never `throw new Error()` for expected domain or application errors (like "Email Taken").
Instead, our Application layer returns a `Result<Value, DomainError>` using `neverthrow`.
- The controller safely unwraps this Result and maps the Domain Error to the correct HTTP Status code and i18n translation key.
- Thrown exceptions are reserved exclusively for actual infrastructure crashes (e.g., Database disconnected).

## Enforcement
The rules defined in `ai_instructions/` are supreme. They are strictly enforced by ESLint boundary rules and Git pre-commit hooks to guarantee 100% architectural integrity.

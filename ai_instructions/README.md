# AI Instructions

These rules define the non-negotiable standards for this codebase. Every AI agent and developer must follow them. They exist to prevent entropy, enforce consistency, and keep the codebase maintainable for years.

Read these files in order before making any code changes.

| File | Purpose |
|------|---------|
| [CORE_RULES.md](./CORE_RULES.md) | Supreme laws. Stack is locked. Never/always rules. |
| [MODULE_RULES.md](./MODULE_RULES.md) | How to create and modify backend modules correctly. |
| [FILE_PLACEMENT_RULES.md](./FILE_PLACEMENT_RULES.md) | Where to create new files. Decision tree + directory map. |
| [PACKAGE_POLICY.md](./PACKAGE_POLICY.md) | How to install any package. Approval flow. |
| [EVENT_AND_ERROR_RULES.md](./EVENT_AND_ERROR_RULES.md) | Domain events mechanism + neverthrow Result pattern. |
| [TESTING_RULES.md](./TESTING_RULES.md) | Unit / Integration / E2E test contract. |
| [FRONTEND_RULES.md](./FRONTEND_RULES.md) | Web + Mobile rules. packages/ui is web-only. |
| [CODE_QUALITY_RULES.md](./CODE_QUALITY_RULES.md) | File size limits, coding principles, naming, anti-patterns. |
| [SECURITY_AND_OPS_RULES.md](./SECURITY_AND_OPS_RULES.md) | Env vars, security, indexing, logging, git workflow. |
| [PERFORMANCE_RULES.md](./PERFORMANCE_RULES.md) | DB queries, caching, frontend perf, bundle size. |

## How to use this

1. Read `CORE_RULES.md` first — always.
2. Before creating/modifying a backend module → read `MODULE_RULES.md`.
3. **Before creating any new file** → read `FILE_PLACEMENT_RULES.md`.
4. Before adding any dependency → read `PACKAGE_POLICY.md`.
5. Before writing error handling or events → read `EVENT_AND_ERROR_RULES.md`.
6. Before writing tests → read `TESTING_RULES.md`.
7. Before touching frontend code → read `FRONTEND_RULES.md`.
8. Before writing any code → read `CODE_QUALITY_RULES.md`.
9. Before config, security, logging, or git work → read `SECURITY_AND_OPS_RULES.md`.
10. Before writing queries, caching, or frontend rendering → read `PERFORMANCE_RULES.md`.

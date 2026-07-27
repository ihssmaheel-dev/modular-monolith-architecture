# AGENTS.md

You are working in a modular monolith codebase. Before making any changes, read and follow the rules in `ai_instructions/`.

## Required Reading Order

1. `ai_instructions/README.md` — Start here.
2. `ai_instructions/CORE_RULES.md` — Supreme laws. Locked stack. Never/always.
3. `ai_instructions/MODULE_RULES.md` — Backend module structure.
4. `ai_instructions/PACKAGE_POLICY.md` — Before installing any package.
5. `ai_instructions/EVENT_AND_ERROR_RULES.md` — Error handling and domain events.
6. `ai_instructions/TESTING_RULES.md` — Test contract.
7. `ai_instructions/FRONTEND_RULES.md` — Web and mobile rules.
8. `ai_instructions/CODE_QUALITY_RULES.md` — Small files, clean code, no anti-patterns.
9. `ai_instructions/SECURITY_AND_OPS_RULES.md` — Env vars, security, indexing, logging, git workflow.

## Non-Negotiable

- Read these files before every task. Do not skip.
- The stack is locked. Do not add, replace, or suggest alternatives without approval.
- Never throw in application/domain layers. Use neverthrow Result.
- Never import another module's Mongoose model.
- packages/ui is web-only. Never use in mobile.
- Every Zod schema, type, and contract lives in packages/shared.
- Ask in every PR: "Is this the simplest structure that could work?"
- Keep files under 150 lines. If it's longer, split it.
- Functions under 30 lines. No deep nesting.
- No magic numbers, no copy-paste, no `any`.

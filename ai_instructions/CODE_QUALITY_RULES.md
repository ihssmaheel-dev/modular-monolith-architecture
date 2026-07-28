# Code Quality Rules

Keep files small, clean, and maintainable. Every file should be easy to understand in isolation.

---

## File Size Limits

| File Type | Max Lines | Action if Exceeded |
|-----------|-----------|-------------------|
| Component | 150 | Extract sub-components or hooks |
| Service / Use Case | 100 | Split into smaller use cases |
| Controller | 80 | Extract route handlers into services |
| Utility / Helper | 60 | Split by concern |
| Type / Schema | 80 | Split into separate files by domain |
| Test file | 200 | Split by describe block |
| Config file | 40 | Split into per-concern configs |

**If a file feels hard to read, it is too big.** Split it.

---

## Coding Principles

### Single Responsibility
- One file = one responsibility.
- One function = one job.
- If you can't describe what a file does in one sentence, split it.

### Small Functions
- Functions should be 5–20 lines.
- If a function exceeds 30 lines, extract helpers.
- Early returns over nested conditionals.

```typescript
// Good
function processOrder(order: Order): Result<Order, OrderError> {
  if (!order.items.length) {
    return err({ type: "EMPTY_ORDER" });
  }

  if (order.total > 10000) {
    return err({ type: "ORDER_TOO_LARGE" });
  }

  const processed = calculateDiscount(order);
  return ok(processed);
}

// Bad
function processOrder(order: Order): Result<Order, OrderError> {
  if (order) {
    if (order.items) {
      if (order.items.length > 0) {
        if (order.total <= 10000) {
          // ... 50 more lines of nested logic
        } else {
          return err({ type: "ORDER_TOO_LARGE" });
        }
      } else {
        return err({ type: "EMPTY_ORDER" });
      }
    }
  }
}
```

### Extract Don't Duplicate
- If you copy-paste more than 3 lines, extract a function.
- If two components share logic, extract a hook or utility.
- Shared code goes in `packages/shared` or the nearest `utils/` folder.

### Naming
- Functions: `verbNoun` — `createUser`, `validateEmail`, `fetchOrders`.
- Booleans: `is`, `has`, `can`, `should` — `isLoading`, `hasPermission`, `canEdit`.
- Components: `Noun` — `UserProfile`, `OrderCard`, `PaymentForm`.
- Events: `past-tense noun` — `UserCreated`, `OrderPlaced`.
- Files: match the export name — `users.service.ts` exports `UsersService`.

### No Magic
- No magic numbers. Use named constants.
- No nested ternaries.
- No more than 2 levels of nesting.
- No `else` when `if` returns.

```typescript
// Bad
const discount = user.isPremium ? order.total * 0.2 : order.total > 500 ? order.total * 0.1 : 0;

// Good
function calculateDiscount(order: Order, isPremium: boolean): number {
  if (isPremium) return order.total * 0.2;
  if (order.total > 500) return order.total * 0.1;
  return 0;
}
```

---

## Async/Await Patterns

### Parallel Operations
Use `Promise.all()` for independent async operations:

```typescript
// Bad — sequential (slow)
const user = await this.userModel.findById(id);
const orders = await this.orderModel.find({ userId: id });
const notifications = await this.notifModel.find({ userId: id });

// Good — parallel (fast)
const [user, orders, notifications] = await Promise.all([
  this.userModel.findById(id),
  this.orderModel.find({ userId: id }),
  this.notifModel.find({ userId: id }),
]);
```

### Sequential Dependencies
Only use sequential awaits when later operations depend on earlier results:

```typescript
const user = await this.userModel.findById(id);    // need user.id
const orders = await this.orderModel.find({ userId: user.id }); // depends on user
```

### Error Handling
Don't swallow errors silently:

```typescript
// Bad
try {
  await riskyOperation();
} catch (e) {
  // silently ignored
}

// Good
try {
  await riskyOperation();
} catch (e) {
  logger.error({ err: e }, "Risky operation failed");
  throw e;
}
```

---

## Memory Leak Prevention

### Event Listeners
Always clean up event listeners:

```typescript
useEffect(() => {
  const handler = (e: KeyboardEvent) => { /* ... */ };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, []);
```

### Abort Controllers
Cancel in-flight requests when components unmount:

```typescript
useEffect(() => {
  const controller = new AbortController();

  fetchData({ signal: controller.signal })
    .then(setData)
    .catch((e) => {
      if (e.name !== "AbortError") throw e;
    });

  return () => controller.abort();
}, []);
```

### Timers
Clean up intervals and timeouts:

```typescript
useEffect(() => {
  const interval = setInterval(poll, 5000);
  return () => clearInterval(interval);
}, []);
```

---

## File Organization

### Imports
- Group imports: external → internal → types.
- One blank line between groups.
- No unused imports.
- No relative imports outside the module boundary.

```typescript
// Good
import { Result, ok, err } from "neverthrow";
import { EventEmitter2 } from "@nestjs/event-emitter";

import { UserRepository } from "../infrastructure/users.repository";
import { User } from "../domain/entities/user";
import { CreateUserInput, UserError } from "../types";
```

### Exports
- One default export per file OR only named exports. Be consistent.
- Prefer named exports — they're easier to refactor.
- Export at the bottom of the file.

### Constants
- Domain constants live in `packages/shared/src/constants/`.
- Module-level constants live at the top of the file.
- No hardcoded strings in business logic.

---

## Anti-Patterns to Avoid

| Anti-Pattern | Instead Do |
|-------------|------------|
| God file (500+ lines) | Split by responsibility |
| God function (100+ lines) | Extract helpers, one job per function |
| Deep nesting (4+ levels) | Early returns, extract conditions |
| Copy-paste code | Extract shared function |
| Magic numbers | Named constants |
| Stringly-typed values | Enums or union types |
| `any` type | `unknown` + type guard |
| Barrel exports re-exporting everything | Export only what's needed |
| Comments explaining "what" | Rename to explain "why" |
| Empty catch blocks | Log or rethrow, never swallow |
| Sequential awaits for independent ops | `Promise.all()` |
| Event listeners without cleanup | Return cleanup function |

---

## The Test

Before submitting a file, ask:

1. Can I understand this file in under 60 seconds?
2. Does this file do one thing well?
3. Are all functions under 30 lines?
4. Is there any duplication I can extract?
5. Would a new developer understand this without comments?
6. Does this file belong where I'm putting it?

If the answer to any is no — refactor before committing.

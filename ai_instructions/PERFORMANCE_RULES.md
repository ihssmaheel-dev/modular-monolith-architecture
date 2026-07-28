# Performance Rules

Write efficient code. Performance is not optional — it's a design constraint.

---

## Database Queries

### MongoDB / Mongoose
- **Always add indexes** for fields used in `find()`, `sort()`, `where`, and compound queries.
- **Use `select()`** to fetch only needed fields. Never fetch full documents when you need 2 fields.
- **Use `lean()`** for read-only queries. Returns plain objects, not Mongoose documents.
- **Use `cursor()`** for large result sets. Don't load thousands of documents into memory.
- **Batch writes** with `insertMany()` or `bulkWrite()` instead of looping `save()`.
- **Use `countDocuments()`** instead of `find().length` for counting.

```typescript
// Bad
const users = await this.model.find({ role: "admin" });
const count = users.length;

// Good
const [users, count] = await Promise.all([
  this.model.find({ role: "admin" }).select("email name").lean(),
  this.model.countDocuments({ role: "admin" }),
]);
```

### N+1 Prevention
- Never query inside a loop. Use `findById` with `$in` for batch lookups.
- If you need related data, aggregate or populate — don't loop queries.

```typescript
// Bad
for (const order of orders) {
  const user = await this.userModel.findById(order.userId);
  order.user = user;
}

// Good
const userIds = orders.map((o) => o.userId);
const users = await this.userModel.find({ _id: { $in: userIds } }).lean();
const userMap = new Map(users.map((u) => [u._id.toString(), u]));
```

---

## Caching

### Redis
- Cache expensive queries and computed results.
- Set TTL. Never cache forever.
- Use cache-aside pattern: check cache → miss → query DB → set cache.

```typescript
async getUser(id: string): Promise<User | null> {
  const cached = await this.redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  const user = await this.userModel.findById(id).lean();
  if (user) await this.redis.setEx(`user:${id}`, 3600, JSON.stringify(user));
  return user;
}
```

### Invalidation
- Invalidate cache on write (update/delete).
- Use event-driven invalidation: `user.updated` → invalidate `user:{id}`.
- Accept eventual consistency for non-critical data.

---

## API Responses

### Pagination
- Always paginate list endpoints. Never return unbounded arrays.
- Default limit: 20. Max limit: 100.
- Return `{ data, total, page, limit }` for every list endpoint.

### Response Size
- Don't return fields the client doesn't need.
- Use field selection in the repository layer.
- Compress responses with Fastify gzip.

### Rate Limiting
- Apply rate limiting to all public endpoints.
- Stricter limits on auth endpoints (login, register).
- Use Redis-backed rate limiting for multi-instance safety.

---

## Frontend Performance

### Web (React)
- Use `React.memo()` for expensive components that receive stable props.
- Use `useMemo()` for expensive computations.
- Use `useCallback()` for callbacks passed to memoized children.
- Lazy-load routes with `React.lazy()` + Suspense.
- Don't re-render the entire tree for local state changes.
- Use TanStack Query's `staleTime` and `cacheTime` to avoid unnecessary refetches.

### Mobile (React Native)
- Use `FlatList` instead of `ScrollView` for long lists.
- Set `getItemLayout` for fixed-height items (skips measurement).
- Use `React.memo()` for list item components.
- Avoid anonymous functions in `renderItem`.
- Use `useCallback` for event handlers in list items.

### Shared
- Avoid unnecessary re-renders. Profile with React DevTools.
- Split large components into smaller ones with focused state.
- Don't put large objects in global state (Zustand) if only one component needs them.

---

## Bundle Size

### Web
- Tree-shake imports. Import only what you use.
- Avoid barrel exports that re-export everything.
- Use dynamic imports for heavy features (charts, editors).
- Analyze bundle with `vite-plugin-visualizer`.

### Mobile
- Use Expo's tree-shaking.
- Avoid large libraries that duplicate what you can write in <30 lines.
- Lazy-load heavy screens.

---

## Node.js / NestJS

### Event Loop
- Never block the event loop with synchronous operations.
- Use `Promise.all()` for independent async operations.
- Use worker threads for CPU-intensive tasks (image processing, CSV parsing).

### Memory
- Don't accumulate data in memory. Stream when possible.
- Clean up event listeners and timers.
- Use `WeakRef` for caches that should be garbage-collected.

### Startup
- Validate env vars once at startup (already done in `config/env.ts`).
- Lazy-connect to Redis/MongoDB. Don't block app start unless required.

---

## Monitoring

- Log slow queries (>100ms).
- Log cache hit/miss ratios.
- Track API response times.
- Alert on memory usage spikes.

---

## The Rule

Before writing any code, ask:
1. Will this query scale to 100k documents?
2. Will this component re-render unnecessarily?
3. Is there a cached result I should check first?
4. Am I fetching more data than I need?
5. Is this operation blocking the event loop?

If the answer to any is concerning — optimize before shipping.

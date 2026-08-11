# Optional multi-tenancy

Tenancy is a deployment-level choice. Set it before creating production data:

```env
TENANCY_MODE=single
```

or:

```env
TENANCY_MODE=multi
```

Single mode is the default. It registers only `GET /api/tenancy/status`, adds no tenant fields to
new records, and preserves the existing application behavior. Multi mode registers the complete
organization, membership, and invitation API.

## Developer workflow

The shared API client automatically sends the selected organization as `x-tenant-id`. Web and
mobile persist the selection through their tenant stores. The first organization can be created
from the built-in switcher or with `POST /api/tenancy/organizations`.

Tenant-owned frontend caches must include the active tenant ID in their query key, or reset when
the tenant changes. Authentication logout/failure already clears the built-in query caches.

To make a domain tenant-owned:

1. Add an optional `tenantId` property to its Mongoose schema. It remains absent in single mode.
2. Extend `TenantScopedRepository` instead of `BaseRepository`.
3. Add compound tenant indexes through a migration.
4. Never accept `tenantId` in a public input schema.

```ts
import { TenantScopedRepository } from "../../../infrastructure/database";

export class OrdersRepository extends TenantScopedRepository<Order, OrderSchema> {
  constructor(@InjectModel(OrderSchema.name) model: Model<OrderSchema>, cls: ClsService) {
    super(model, cls);
  }
}
```

Every inherited create, ID lookup, query, update, pagination, soft delete, and delete is then scoped
from trusted request context. Caller-supplied tenant filters are overwritten. Direct `this.model`
queries are prohibited in tenant-owned repositories because they bypass isolation.

Global data such as users and organization records continues to use `BaseRepository`. Membership
APIs expose users inside an organization; global user administration remains system-admin only.

## Requests and clients

Multi-tenant protected requests require:

```http
X-Tenant-Id: 507f1f77bcf86cd799439011
```

The API verifies active membership before permissions run. Tenant owners, admins, and members have
separate shared permission maps. WebSockets and SSE also verify and retain the tenant selected at
connection time.

API client setup:

```ts
createApiClient(baseUrl, {
  getTenantId: () => tenantStore.activeTenantId,
});
```

Mutation requests receive automatic idempotency keys. Idempotency cache entries, uploads, audit
records, outbox events, and realtime delivery all include tenant scope.

## Background work

Workers must restore tenant context before calling a tenant-owned repository:

```ts
await tenantContext.run({ mode: "multi", tenantId }, async () => {
  await command.execute(input);
});
```

Include `tenantId` in every tenant-owned job or event payload. Never infer it from a user ID because
one user may belong to multiple organizations.

## Switching an existing project

Do not change a populated deployment from single to multi by changing the environment variable
alone. Create a migration that creates a default organization and owner membership, backfills every
tenant-owned document, prefixes cache/storage keys, and validates compound indexes. Test that
migration against a production-sized copy before enabling multi mode.

Multi-tenant organization creation and invitation acceptance use MongoDB transactions. Production
MongoDB must run as a replica set or managed cluster with transaction support.

For local multi-tenant development, start the included single-node replica set:

```sh
docker compose -f docker/docker-compose.yml --profile multi up -d mongodb-replica
```

Then use:

```env
MONGODB_URI=mongodb://localhost:27018/app?replicaSet=rs0
TENANCY_MODE=multi
```

The replica service is bound to localhost, stores data in its own volume, and is not intended for
production.

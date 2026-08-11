import type { Collection, Db, IndexSpecification } from "mongodb";

interface IndexDefinition {
  keys: IndexSpecification;
  name: string;
  unique?: boolean;
  partialFilterExpression?: Record<string, unknown>;
  expireAfterSeconds?: number;
}

const indexes: Record<string, IndexDefinition[]> = {
  organizations: [
    { keys: { slug: 1 }, name: "organizations_slug_unique", unique: true },
    { keys: { createdBy: 1, createdAt: -1 }, name: "organizations_creator_created" },
  ],
  memberships: [
    {
      keys: { tenantId: 1, userId: 1 },
      name: "memberships_tenant_user_unique",
      unique: true,
    },
    { keys: { userId: 1, createdAt: -1 }, name: "memberships_user_created" },
    { keys: { tenantId: 1, role: 1, createdAt: 1 }, name: "memberships_tenant_role_created" },
    { keys: { tenantId: 1, userEmail: 1 }, name: "memberships_tenant_email" },
  ],
  invitations: [
    { keys: { tokenHash: 1 }, name: "invitations_token_unique", unique: true },
    { keys: { tenantId: 1, status: 1, createdAt: -1 }, name: "invitations_tenant_status" },
    {
      keys: { tenantId: 1, email: 1 },
      name: "invitations_pending_email_unique",
      unique: true,
      partialFilterExpression: { status: "pending" },
    },
    { keys: { expiresAt: 1 }, name: "invitations_expiry", expireAfterSeconds: 0 },
  ],
  notes: [
    {
      keys: { tenantId: 1, createdBy: 1, createdAt: -1 },
      name: "notes_tenant_owner_created",
      partialFilterExpression: { tenantId: { $type: "string" } },
    },
  ],
  files: [
    {
      keys: { tenantId: 1, uploadedBy: 1, createdAt: -1 },
      name: "files_tenant_owner_created",
      partialFilterExpression: { tenantId: { $type: "string" } },
    },
    {
      keys: { tenantId: 1, parentType: 1, parentId: 1, createdAt: -1 },
      name: "files_tenant_parent_created",
      partialFilterExpression: { tenantId: { $type: "string" } },
    },
  ],
  audit_logs: [{ keys: { tenantId: 1, createdAt: -1 }, name: "audit_tenant_created" }],
  outbox_events: [
    { keys: { tenantId: 1, status: 1, createdAt: 1 }, name: "outbox_tenant_status_created" },
  ],
};

export async function up(db: Db): Promise<void> {
  for (const [collectionName, definitions] of Object.entries(indexes)) {
    const collection = db.collection(collectionName);
    for (const definition of definitions) {
      const { keys, ...options } = definition;
      await collection.createIndex(keys, options);
    }
  }
}

export async function down(db: Db): Promise<void> {
  for (const [collectionName, definitions] of Object.entries(indexes)) {
    const collection = db.collection(collectionName);
    for (const definition of definitions) await dropIfPresent(collection, definition.name);
  }
}

async function dropIfPresent(collection: Collection, name: string): Promise<void> {
  const existing = await collection.indexes();
  if (existing.some((index) => index.name === name)) await collection.dropIndex(name);
}

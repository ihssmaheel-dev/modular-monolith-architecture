import type { Collection, Db } from "mongodb";

const LEGACY_INDEXES = ["collectionName_1", "documentId_1", "actorId_1"];
const INDEXES = ["audit_document_created", "audit_actor_created"];

export async function up(db: Db): Promise<void> {
  const auditLogs = db.collection("audit_logs");
  for (const name of LEGACY_INDEXES) await dropIfPresent(auditLogs, name);
  await auditLogs.createIndex(
    { collectionName: 1, documentId: 1, createdAt: -1 },
    { name: INDEXES[0] },
  );
  await auditLogs.createIndex({ actorId: 1, createdAt: -1 }, { name: INDEXES[1], sparse: true });
}

export async function down(db: Db): Promise<void> {
  const auditLogs = db.collection("audit_logs");
  for (const name of INDEXES) await dropIfPresent(auditLogs, name);
}

async function dropIfPresent(collection: Collection, name: string): Promise<void> {
  const indexes = await collection.indexes();
  if (indexes.some((index) => index.name === name)) await collection.dropIndex(name);
}

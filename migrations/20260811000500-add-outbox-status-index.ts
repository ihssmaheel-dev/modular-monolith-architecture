import type { Collection, Db } from "mongodb";

const INDEX_NAME = "outbox_status_created";

export async function up(db: Db): Promise<void> {
  const outbox = db.collection("outbox_events");
  await dropIfPresent(outbox, "topic_1");
  await dropIfPresent(outbox, "status_1");
  await outbox.createIndex({ status: 1, createdAt: 1 }, { name: INDEX_NAME });
}

export async function down(db: Db): Promise<void> {
  await dropIfPresent(db.collection("outbox_events"), INDEX_NAME);
}

async function dropIfPresent(collection: Collection, name: string): Promise<void> {
  const indexes = await collection.indexes();
  if (indexes.some((index) => index.name === name)) await collection.dropIndex(name);
}

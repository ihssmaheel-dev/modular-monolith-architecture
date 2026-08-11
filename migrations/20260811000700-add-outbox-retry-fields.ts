import type { Collection, Db } from "mongodb";

const OLD_INDEX = "outbox_status_created";
const INDEX_NAME = "outbox_status_retry_created";

export async function up(db: Db): Promise<void> {
  const outbox = db.collection("outbox_events");
  await outbox.updateMany({ attempts: { $exists: false } }, { $set: { attempts: 0 } });
  await dropIfPresent(outbox, OLD_INDEX);
  await outbox.createIndex({ status: 1, nextAttemptAt: 1, createdAt: 1 }, { name: INDEX_NAME });
}

export async function down(db: Db): Promise<void> {
  const outbox = db.collection("outbox_events");
  await dropIfPresent(outbox, INDEX_NAME);
  await outbox.updateMany({}, { $unset: { attempts: "", nextAttemptAt: "", lockedAt: "" } });
}

async function dropIfPresent(collection: Collection, name: string): Promise<void> {
  const indexes = await collection.indexes();
  if (indexes.some((index) => index.name === name)) await collection.dropIndex(name);
}

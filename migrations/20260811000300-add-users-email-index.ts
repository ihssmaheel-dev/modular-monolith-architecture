import type { Collection, Db } from "mongodb";

const INDEX_NAME = "users_email_unique";

export async function up(db: Db): Promise<void> {
  const users = db.collection("users");
  await dropIfPresent(users, "email_1");
  await users.createIndex({ email: 1 }, { name: INDEX_NAME, unique: true });
}

export async function down(db: Db): Promise<void> {
  await dropIfPresent(db.collection("users"), INDEX_NAME);
}

async function dropIfPresent(collection: Collection, name: string): Promise<void> {
  const indexes = await collection.indexes();
  if (indexes.some((index) => index.name === name)) await collection.dropIndex(name);
}

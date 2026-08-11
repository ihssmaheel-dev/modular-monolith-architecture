import type { Db } from "mongodb";

const USERS_COLLECTION = "users";

export async function up(db: Db): Promise<void> {
  await db
    .collection(USERS_COLLECTION)
    .updateMany({ authVersion: { $exists: false } }, { $set: { authVersion: 0 } });
}

export async function down(db: Db): Promise<void> {
  await db.collection(USERS_COLLECTION).updateMany({}, { $unset: { authVersion: "" } });
}

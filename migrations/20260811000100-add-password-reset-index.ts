import type { Db } from "mongodb";

const USERS_COLLECTION = "users";
const INDEX_NAME = "users_password_reset_token_expiry";

export async function up(db: Db): Promise<void> {
  await db
    .collection(USERS_COLLECTION)
    .createIndex(
      { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 },
      { name: INDEX_NAME, sparse: true },
    );
}

export async function down(db: Db): Promise<void> {
  await db.collection(USERS_COLLECTION).dropIndex(INDEX_NAME);
}

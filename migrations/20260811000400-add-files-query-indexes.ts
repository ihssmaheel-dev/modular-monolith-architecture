import type { Collection, Db } from "mongodb";

const LEGACY_INDEXES = ["key_1", "parentId_1", "uploadedBy_1", "parentType_1_parentId_1"];
const INDEXES = ["files_key_unique", "files_parent_created", "files_owner_parent_created"];

export async function up(db: Db): Promise<void> {
  const files = db.collection("files");
  for (const name of LEGACY_INDEXES) await dropIfPresent(files, name);
  await files.createIndex({ key: 1 }, { name: INDEXES[0], unique: true });
  await files.createIndex({ parentType: 1, parentId: 1, createdAt: -1 }, { name: INDEXES[1] });
  await files.createIndex(
    { uploadedBy: 1, parentType: 1, parentId: 1, createdAt: -1 },
    { name: INDEXES[2] },
  );
}

export async function down(db: Db): Promise<void> {
  const files = db.collection("files");
  for (const name of INDEXES) await dropIfPresent(files, name);
}

async function dropIfPresent(collection: Collection, name: string): Promise<void> {
  const indexes = await collection.indexes();
  if (indexes.some((index) => index.name === name)) await collection.dropIndex(name);
}

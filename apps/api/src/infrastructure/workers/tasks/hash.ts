export interface HashInput {
  data: string;
  algorithm?: "sha256" | "sha512";
}

export interface HashOutput {
  hash: string;
  algorithm: string;
}

import { createHash } from "node:crypto";

export async function computeHash(input: HashInput): Promise<HashOutput> {
  const algorithm = input.algorithm ?? "sha256";
  const hash = createHash(algorithm).update(input.data).digest("hex");
  return { hash, algorithm };
}

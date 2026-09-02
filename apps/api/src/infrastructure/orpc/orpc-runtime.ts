import { createRequire } from "node:module";

const loadModule = createRequire(__filename);
const nestRuntime = loadModule("@orpc/nest") as typeof import("@orpc/nest", {
  with: { "resolution-mode": "import" },
});
const serverRuntime = loadModule("@orpc/server") as typeof import("@orpc/server", {
  with: { "resolution-mode": "import" },
});

export const Implement = nestRuntime.Implement;
export const implement = nestRuntime.implement;
export const ORPCModule = nestRuntime.ORPCModule;
export const ORPCError = serverRuntime.ORPCError;

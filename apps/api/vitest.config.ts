import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["src/**/*.e2e.test.ts", "src/**/*.integration.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.integration.test.ts",
        "src/**/*.e2e.test.ts",
        "src/**/*.module.ts",
        "src/**/index.ts",
        "src/**/*.types.ts",
        "src/**/schemas/*.schema.ts",
      ],
      reporter: ["text", "json-summary"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

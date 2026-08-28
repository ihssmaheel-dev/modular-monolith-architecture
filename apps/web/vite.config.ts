import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import path from "path";

export default defineConfig({
  plugins: [TanStackRouterVite({ autoCodeSplitting: true }), react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@repo/contracts": path.resolve(import.meta.dirname, "../../packages/contracts/src"),
      "@repo/authorization": path.resolve(import.meta.dirname, "../../packages/authorization/src"),
      "@repo/i18n": path.resolve(import.meta.dirname, "../../packages/i18n/src"),
      "@repo/design-tokens": path.resolve(import.meta.dirname, "../../packages/design-tokens/src"),
      "@repo/api-client": path.resolve(import.meta.dirname, "../../packages/api-client/src"),
    },
  },
  server: {
    port: 5173,
    host: "127.0.0.1",
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3000",
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ["@repo/contracts", "@repo/authorization", "@repo/i18n", "@repo/design-tokens", "@repo/api-client"],
  },
});

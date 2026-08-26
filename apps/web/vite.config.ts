import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import path from "path";

export default defineConfig({
  plugins: [TanStackRouterVite({ autoCodeSplitting: true }), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@repo/contracts": path.resolve(__dirname, "../../packages/contracts/src"),
      "@repo/authorization": path.resolve(__dirname, "../../packages/authorization/src"),
      "@repo/i18n": path.resolve(__dirname, "../../packages/i18n/src"),
      "@repo/design-tokens": path.resolve(__dirname, "../../packages/design-tokens/src"),
      "@repo/api-client": path.resolve(__dirname, "../../packages/api-client/src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ["@repo/contracts", "@repo/authorization", "@repo/i18n", "@repo/design-tokens", "@repo/api-client"],
  },
});

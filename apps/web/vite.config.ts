import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-vite-plugin";
import path from "path";

export default defineConfig({
  plugins: [react(), TanStackRouterVite()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@repo/shared": path.resolve(__dirname, "../../packages/shared/src"),
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
    exclude: ["@repo/shared", "@repo/api-client"],
  },
});

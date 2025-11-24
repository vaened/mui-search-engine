import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});

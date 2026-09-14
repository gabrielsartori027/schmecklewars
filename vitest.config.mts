import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    environmentMatchGlobs: [["src/**/*.test.tsx", "jsdom"]],
    setupFiles: ["./src/tests/setup.ts"],
    coverage: { provider: "v8", reporter: ["text"], include: ["src/lib/**"] },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./src/tests/server-only.ts"),
    },
  },
});

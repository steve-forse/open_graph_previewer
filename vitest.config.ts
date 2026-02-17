import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./app/frontend/test-setup.ts"],
    include: ["app/frontend/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["app/frontend/**/*.{ts,tsx}"],
      exclude: [
        "app/frontend/entrypoints/**",
        "app/frontend/test-setup.ts",
        "app/frontend/types/**",
      ],
    },
  },
});

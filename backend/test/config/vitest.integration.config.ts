import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: "test/utils/setup.ts",
    setupFiles: "test/utils/setup-files.ts",
    include: ["test/integration/**/*.spec.ts"],
    passWithNoTests: true,
    reporters: "verbose",
    maxConcurrency: 1,
  },
  plugins: [swc.vite()],
});

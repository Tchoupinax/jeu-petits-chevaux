import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "src/app.module.spec.ts",
      "src/domain/**/*.spec.ts",
    ],
    reporters: "verbose",
    typecheck: {
      include: ["src/domain/entities/*.ts"],
    },
  },
});

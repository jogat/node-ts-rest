import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@config": path.resolve(__dirname, "src/config"),
      "@console": path.resolve(__dirname, "src/console"),
      "@database": path.resolve(__dirname, "src/database"),
      "@exceptions": path.resolve(__dirname, "src/exceptions"),
      "@http": path.resolve(__dirname, "src/http"),
      "@models": path.resolve(__dirname, "src/models"),
      "@policies": path.resolve(__dirname, "src/policies"),
      "@routes": path.resolve(__dirname, "src/routes"),
      "@services": path.resolve(__dirname, "src/services"),
      "@support": path.resolve(__dirname, "src/support"),
    },
  },
  test: {
    environment: "node",
    fileParallelism: false,
  },
});

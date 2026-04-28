import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@config": path.resolve(__dirname, "src/config"),
      "@database": path.resolve(__dirname, "src/database"),
      "@exceptions": path.resolve(__dirname, "src/exceptions"),
      "@http": path.resolve(__dirname, "src/http"),
      "@routes": path.resolve(__dirname, "src/routes"),
    },
  },
  test: {
    environment: "node",
  },
});

import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@config": path.resolve(__dirname, "src/config"),
      "@console": path.resolve(__dirname, "src/console"),
      "@database": path.resolve(__dirname, "src/database"),
      "@events": path.resolve(__dirname, "src/events"),
      "@exceptions": path.resolve(__dirname, "src/exceptions"),
      "@http": path.resolve(__dirname, "src/http"),
      "@jobs": path.resolve(__dirname, "src/jobs"),
      "@listeners": path.resolve(__dirname, "src/listeners"),
      "@mail": path.resolve(__dirname, "src/mail"),
      "@models": path.resolve(__dirname, "src/models"),
      "@notifications": path.resolve(__dirname, "src/notifications"),
      "@policies": path.resolve(__dirname, "src/policies"),
      "@queue": path.resolve(__dirname, "src/queue"),
      "@routes": path.resolve(__dirname, "src/routes"),
      "@schedule": path.resolve(__dirname, "src/schedule"),
      "@services": path.resolve(__dirname, "src/services"),
      "@storage": path.resolve(__dirname, "src/storage"),
      "@support": path.resolve(__dirname, "src/support"),
    },
  },
  test: {
    environment: "node",
    fileParallelism: false,
  },
});

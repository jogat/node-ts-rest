import "dotenv/config";
import "tsconfig-paths/register.js";
import type { Knex } from "knex";

type DatabaseEnvironment = "development" | "test" | "production";

const baseConfig = (environment: DatabaseEnvironment): Knex.Config => ({
  client: environment === "test" ? "sqlite3" : process.env.DB_CONNECTION || "mysql2",
  connection:
    environment === "test"
      ? {
          filename: process.env.TEST_DB_DATABASE || process.env.DB_DATABASE_TEST || "./storage/testing.sqlite3",
        }
      : {
          host: process.env.DB_HOST || "127.0.0.1",
          port: Number(process.env.DB_PORT || 3306),
          database: process.env.DB_DATABASE || "portfolio",
          user: process.env.DB_USERNAME || "root",
          password: process.env.DB_PASSWORD || "",
        },
  useNullAsDefault: environment === "test",
  migrations: {
    directory: "./src/database/migrations",
    extension: "ts",
  },
  seeds: {
    directory: "./src/database/seeders",
    extension: "ts",
  },
});

const config: Record<DatabaseEnvironment, Knex.Config> = {
  development: baseConfig("development"),
  test: baseConfig("test"),
  production: baseConfig("production"),
};

export default config;

import "dotenv/config";
import type { Knex } from "knex";

type DatabaseEnvironment = "development" | "test" | "production";

const baseConfig = (environment: DatabaseEnvironment): Knex.Config => ({
  client: process.env.DB_CONNECTION || "mysql2",
  connection: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    database: databaseName(environment),
    user: process.env.DB_USERNAME || "root",
    password: process.env.DB_PASSWORD || "",
  },
  migrations: {
    directory: "./src/database/migrations",
    extension: "ts",
  },
  seeds: {
    directory: "./src/database/seeders",
    extension: "ts",
  },
});

function databaseName(environment: DatabaseEnvironment): string {
  if (environment === "test") {
    return process.env.TEST_DB_DATABASE || process.env.DB_DATABASE_TEST || "portfolio_test";
  }

  return process.env.DB_DATABASE || "portfolio";
}

const config: Record<DatabaseEnvironment, Knex.Config> = {
  development: baseConfig("development"),
  test: baseConfig("test"),
  production: baseConfig("production"),
};

export default config;

import { Knex } from "knex";

export type DatabaseEnvironment = "development" | "test" | "production";
export type MysqlConnection = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};

export type DatabaseConnectionConfig = Omit<Knex.Config, "connection"> & {
  connection: MysqlConnection;
};

const environment = resolveEnvironment();

export const databaseConfig = {
  environment,
  connection: resolveConnection(environment),
};

function resolveEnvironment(): DatabaseEnvironment {
  if (process.env.NODE_ENV === "test") {
    return "test";
  }

  if (process.env.NODE_ENV === "production") {
    return "production";
  }

  return "development";
}

function resolveConnection(environment: DatabaseEnvironment): DatabaseConnectionConfig {
  return {
    client: process.env.DB_CONNECTION || "mysql2",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || 3306),
      database: resolveDatabaseName(environment),
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
  };
}

function resolveDatabaseName(environment: DatabaseEnvironment): string {
  if (environment === "test") {
    return process.env.TEST_DB_DATABASE || process.env.DB_DATABASE_TEST || "portfolio_test";
  }

  return process.env.DB_DATABASE || "portfolio";
}

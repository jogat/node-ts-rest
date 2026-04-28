import { Knex } from "knex";

export type DatabaseEnvironment = "development" | "test" | "production";
export type MysqlConnection = {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
};
export type SqliteConnection = {
  filename: string;
};

export type DatabaseConnectionConfig = Omit<Knex.Config, "connection"> & {
  connection: MysqlConnection | SqliteConnection;
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
  if (environment === "test") {
    return {
      client: "sqlite3",
      connection: {
        filename: process.env.TEST_DB_DATABASE || process.env.DB_DATABASE_TEST || "./storage/testing.sqlite3",
      },
      useNullAsDefault: true,
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

  return {
    client: process.env.DB_CONNECTION || "mysql2",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number(process.env.DB_PORT || 3306),
      database: process.env.DB_DATABASE || "portfolio",
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

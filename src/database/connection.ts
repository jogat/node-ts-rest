import knex, { Knex } from "knex";
import { config } from "@config/index";

export const db: Knex = knex(config.database.connection);

export async function closeDatabaseConnection(): Promise<void> {
  await db.destroy();
}

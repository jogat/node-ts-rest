import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("posts", (table) => {
    table
      .integer("user_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.index(["user_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("posts", (table) => {
    table.dropIndex(["user_id"]);
    table.dropColumn("user_id");
  });
}

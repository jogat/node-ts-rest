import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("posts", (table) => {
    table.increments("id").primary();
    table.string("title", 255).notNullable();
    table.text("body").notNullable();
    table.string("slug", 255).notNullable().unique();
    table.boolean("published").notNullable().defaultTo(false);
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("posts");
}

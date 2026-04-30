import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("slugs", (table) => {
    table.increments("id").primary();
    table.integer("sluggable_model_id").unsigned().notNullable();
    table.string("sluggable_model_class", 255).notNullable();
    table.string("slug", 255).notNullable().unique();
    table.unique(["sluggable_model_class", "sluggable_model_id"]);
    table.index(["sluggable_model_class", "sluggable_model_id"], "slugs_model_lookup_index");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("slugs");
}

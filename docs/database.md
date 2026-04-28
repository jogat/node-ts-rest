# Database Guide

This project uses Knex with mysql2 for a Laravel-like database layer. Knex owns migrations, seeders, and query-builder access. The application keeps Express as the runtime and builds model-like classes on top of Knex instead of adopting a full ORM.

## Environment Variables

Use separate databases per environment.

```bash
DB_CONNECTION=mysql2
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=portfolio
DB_USERNAME=root
DB_PASSWORD=

TEST_DB_DATABASE=portfolio_test
```

Production should use host-provided environment variables. Tests should use `portfolio_test`, not the local development database.

## Configuration

Database config lives in `src/config/database.ts` and is exported through `src/config/index.ts`.

Knex CLI commands use `knexfile.ts`, which maps:

```text
development -> DB_DATABASE or portfolio
test        -> TEST_DB_DATABASE or portfolio_test
production -> DB_DATABASE from the production environment
```

The shared app connection is exported from `src/database/connection.ts`:

```ts
import { db } from "@database/connection";
```

## Commands

```bash
npm run db:make:migration create_posts_table
npm run db:migrate
npm run db:rollback
npm run db:seed
npm run db:status
```

Run commands against the test database with:

```bash
NODE_ENV=test npm run db:migrate
NODE_ENV=test npm run db:rollback
```

## Migrations

Fields are defined in migrations. Keep schema changes explicit and reversible.

```ts
import { Knex } from "knex";

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
```

## Relationships

Relationships are defined in migrations with foreign keys. Query helpers live in model-like classes.

```ts
import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("comments", (table) => {
    table.increments("id").primary();
    table
      .integer("post_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("posts")
      .onDelete("CASCADE");
    table.text("body").notNullable();
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("comments");
}
```

Relationship rule:

```text
Fields live in migrations.
Relationships live in migrations as foreign keys.
Relationship query helpers live in model-like classes.
API shape lives in resources.
Input rules live in requests.
```

## Model-Like Classes

Keep model-like classes thin and explicit. They should centralize table names and common queries without hiding Knex.

```ts
import { db } from "@database/connection";

export type PostRow = {
  id: number;
  title: string;
  body: string;
  slug: string;
  published: boolean;
  created_at: Date;
  updated_at: Date | null;
};

export class Post {
  static table = "posts";

  static query() {
    return db<PostRow>(Post.table);
  }

  static all() {
    return Post.query().select("*");
  }

  static find(id: number) {
    return Post.query().where({ id }).first();
  }

  static comments(id: number) {
    return db("comments").where({ post_id: id });
  }
}
```

## Query Builder Usage

Use Knex for explicit queries:

```ts
const posts = await db("posts").orderBy("created_at", "desc");

const post = await db("posts").where({ id }).first();

const [id] = await db("posts").insert({
  title: "Hello",
  body: "First post",
  slug: "hello",
});
```

Use transactions when multiple writes must succeed or fail together:

```ts
await db.transaction(async (trx) => {
  const [postId] = await trx("posts").insert({ title, body, slug });
  await trx("comments").insert({ post_id: postId, body: "First comment" });
});
```

## Seeders

Seeders live in `src/database/seeders`.

```ts
import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("posts").del();
  await knex("posts").insert([
    {
      title: "Hello",
      body: "First post",
      slug: "hello",
      published: true,
    },
  ]);
}
```

## Testing With MySQL

Tests should use the MySQL test database.

Recommended test flow for database-backed feature tests:

```bash
NODE_ENV=test npm run db:migrate
npm run test
```

Database tests should clean up their own rows or use migrations/seeders to reset known state. Do not point tests at the development or production database.

## AI Agent Notes

- Use `knex` and `mysql2`; do not introduce Prisma, TypeORM, or Drizzle without a new decision.
- Put schema fields and foreign keys in migrations.
- Put table query helpers in model-like classes.
- Put request validation in `src/http/requests`.
- Put response shaping in `src/http/resources`.
- Prefer explicit query-builder code over hidden ORM behavior.

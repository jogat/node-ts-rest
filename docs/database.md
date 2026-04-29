# Database Guide

This project uses Knex with mysql2 for local and production MySQL, and SQLite for tests. Knex owns migrations, seeders, and query-builder access. The application keeps Express as the runtime and builds model-like classes on top of Knex instead of adopting a full ORM.

## Environment Variables

Use separate databases per environment.

```bash
DB_CONNECTION=mysql2
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=portfolio
DB_USERNAME=root
DB_PASSWORD=

TEST_DB_DATABASE=./storage/testing.sqlite3
```

Production should use host-provided environment variables. Tests use a separate SQLite database file, not the local development MySQL database.

Make sure the configured MySQL user can access the local development database:

```sql
CREATE DATABASE IF NOT EXISTS portfolio;
GRANT ALL PRIVILEGES ON portfolio.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
```

## Configuration

Database config lives in `src/config/database.ts` and is exported through `src/config/index.ts`.

Knex CLI commands use `knexfile.ts`, which maps:

```text
development -> DB_DATABASE or portfolio
test        -> TEST_DB_DATABASE or ./storage/testing.sqlite3
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

The Artisan-style console exposes equivalent commands:

```bash
npm run artisan -- db status
npm run artisan -- db migrate
npm run artisan -- db rollback
npm run artisan -- db seed
```

Run commands against the SQLite test database with:

```bash
NODE_ENV=test npm run db:migrate
NODE_ENV=test npm run db:rollback
```

## Migrations

Fields are defined in migrations. Keep schema changes explicit and reversible.

```ts
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
```

## Relationships

Relationships are defined in migrations with foreign keys. Query helpers live in model-like classes.

```ts
import type { Knex } from "knex";

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

Auth tables follow the same relationship convention:

```text
users has many personal_access_tokens
personal_access_tokens belongs to user
```

The token table stores `token_hash`, never a raw plain-text token.

Post ownership is represented by `posts.user_id`, which references `users.id`.

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

Auth model-like classes live under `src/models/`:

```text
User
PersonalAccessToken
```

`User.tokens(userId)` returns a user's personal access tokens. `PersonalAccessToken.user(token)` returns the owning user.

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

## Database Exceptions

Known unique constraint failures are mapped by the central exception handler instead of leaking raw database errors.

Current mapped conflicts:

```text
users.email -> The email has already been taken.
posts.slug -> The slug has already been taken.
personal_access_tokens.token_hash -> The token has already been taken.
```

Mapped conflicts return:

```json
{
  "message": "The email has already been taken.",
  "status": 409
}
```

Add new known database constraint mappings in `src/exceptions/DatabaseExceptionMapper.ts`.

## Seeders

Seeders live in `src/database/seeders`.

```ts
import type { Knex } from "knex";

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

## Testing With SQLite

Tests use a separate SQLite database file. The default path is `./storage/testing.sqlite3`.

Recommended test flow for database-backed feature tests:

```bash
npm run test
```

The `npm test` script sets `NODE_ENV=test`, and the Post feature tests run migrations before executing. Database tests should clean up their own rows or use migrations/seeders to reset known state. Do not point tests at the development or production MySQL database.

## AI Agent Notes

- Use `knex`, `mysql2` for local/production, and `sqlite3` for tests; do not introduce Prisma, TypeORM, or Drizzle without a new decision.
- Put schema fields and foreign keys in migrations.
- Put table query helpers in model-like classes.
- Store only hashed access tokens, not raw bearer tokens.
- Map known database constraint errors through `DatabaseExceptionMapper`.
- Put request validation in `src/http/requests`.
- Put response shaping in `src/http/resources`.
- Prefer explicit query-builder code over hidden ORM behavior.

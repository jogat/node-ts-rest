# Testing Guide

This project uses Vitest and Supertest for API feature tests. Tests run in Node, load the Express app directly, and use a separate SQLite database for database-backed scenarios.

## Test Command

Run the full test suite with:

```bash
npm test
```

The script sets `NODE_ENV=test`:

```json
"test": "NODE_ENV=test vitest run"
```

Do not run tests against the development or production MySQL database.

## Test Environment

When `NODE_ENV=test`, `src/config/database.ts` switches Knex to SQLite:

```text
client: sqlite3
default file: ./storage/testing.sqlite3
```

Override the SQLite file path with:

```bash
TEST_DB_DATABASE=./storage/custom-testing.sqlite3 npm test
```

Generated SQLite files are ignored by git:

```text
storage/*.sqlite
storage/*.sqlite3
storage/*.db
```

The `storage/.gitkeep` file keeps the directory available for local test database files.

Vitest runs test files sequentially because feature tests share the same SQLite database file.

## Key Files

```text
package.json                 Test command
vitest.config.ts             Vitest aliases and Node environment
src/config/database.ts       Test database switch to SQLite
src/database/connection.ts   Shared Knex connection used by app and tests
knexfile.ts                  Knex CLI environment config
tests/feature/               Feature tests
storage/.gitkeep             Keeps the SQLite storage directory in git
```

## Feature Test Pattern

Feature tests should instantiate the Express app without opening a fixed server port:

```ts
import request from "supertest";
import { Server } from "../../src/app/Server";

const app = new Server().getExpressApp();
```

Database-backed tests should migrate SQLite before running and close the Knex connection afterward:

```ts
import { afterAll, beforeAll, beforeEach } from "vitest";
import { closeDatabaseConnection, db } from "../../src/database/connection";

beforeAll(async () => {
  await db.migrate.latest();
});

beforeEach(async () => {
  await db("posts").del();
});

afterAll(async () => {
  await closeDatabaseConnection();
});
```

Use `beforeEach` cleanup for rows created by a test. Keep tests independent and do not rely on execution order.

## What To Test

For each route group, cover:

- successful response shape
- request validation failures
- missing resource `404` responses
- resource collection shape
- pagination metadata for collection endpoints
- database-backed create/read behavior where applicable
- update/delete behavior where applicable
- model relationship helpers where schema behavior matters
- protected route authentication behavior where middleware groups apply
- policy authorization behavior for protected owner-only actions
- auth register/login/me/logout behavior
- mapped database conflict behavior for unique constraints

Prefer asserting public API JSON shapes rather than internal implementation details.

## Async Controllers

Express 4 does not automatically route thrown async errors to the error middleware. Async controllers must be wrapped with `asyncHandler` in route files:

```ts
router.get("/posts/:id", asyncHandler(postController.show));
```

This keeps `HttpException`, `ValidationException`, and unexpected async errors flowing through the central `errorHandler`.

## AI Agent Notes

- Use `npm test` as the default verification command.
- Tests use SQLite only because `NODE_ENV=test` switches the database config.
- Do not require MySQL grants or MySQL test databases for normal tests.
- Put new tests under `tests/feature/` unless a lower-level unit test is clearly more appropriate.
- Keep generated SQLite files out of source control.
- If a new path alias is added to `tsconfig.json`, mirror it in `vitest.config.ts`.

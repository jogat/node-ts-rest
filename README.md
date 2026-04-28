# Portfolio 2025 Server

This is the backend server for the Portfolio 2025 project. It is an Express and TypeScript API organized with Laravel-inspired conventions: centralized config, route files, controller classes, middleware, and a Laravel-style exception handler.

The goal is to keep the runtime lightweight and Express-native while making the project structure feel familiar, predictable, and easy to extend as more backend modules are added.

## Requirements

- Node.js
- npm

Install dependencies:

```bash
npm install
```

## Environment

Create a local `.env` file when you need to override defaults.

Supported variables:

```bash
PORT=3000
PREFIX=/ws
NODE_ENV=development
DB_CONNECTION=mysql2
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=portfolio
DB_USERNAME=root
DB_PASSWORD=
TEST_DB_DATABASE=./storage/testing.sqlite3
```

Defaults are defined in `src/config/app.ts`.

Database conventions are documented in `docs/database.md`.

## Run Locally

Start the development server:

```bash
npm run dev
```

The local server runs on:

```text
http://localhost:3000
```

Current routes:

```text
GET /              Express health/root response
GET /ws/v1/posts   Post collection response
POST /ws/v1/posts  Create post response
GET /ws/v1/posts/:id
PATCH /ws/v1/posts/:id
DELETE /ws/v1/posts/:id
GET /ws/v1/test    Test JSON response
POST /ws/v1/test   Example validated JSON request
```

## Build

Compile TypeScript and rewrite path aliases:

```bash
npm run build
```

Compiled files are written to `dist/`.

## Run In Production

Build the app first:

```bash
npm run build
```

Then run the compiled server:

```bash
NODE_ENV=production npm run start
```

The production entrypoint is:

```text
dist/app.js
```

For a real deployment, set production environment variables in the host or process manager instead of committing `.env` files.

## Boost

This project includes a lightweight Laravel Boost-style helper. It prints project context for developers and AI agents working in the codebase.

Print project context:

```bash
npm run boost
```

Print discovered route registrations:

```bash
npm run boost:routes
```

Run a basic project structure check:

```bash
npm run boost:doctor
```

The human-readable Boost guide lives in `BOOST.md`.

## Tests

Run tests with:

```bash
npm run test
```

Tests use Vitest and Supertest.

Testing conventions are documented in `docs/testing.md`.

## Project Structure

```text
src/
  app.ts                         Server bootstrap
  app/
    Server.ts                    Express app setup
  config/
    app.ts                       App env config
    cors.ts                      CORS config
    database.ts                  Knex database config
    index.ts                     Config export
  database/
    connection.ts                Shared Knex connection
    migrations/                  Knex migration files
    seeders/                     Knex seed files
  exceptions/
    Handler.ts                   Central error renderer
    HttpException.ts             Base HTTP exception
    NotFoundException.ts         404 exception
  http/
    controllers/
      TestController.ts          Example controller
    middleware/
      errorHandler.ts            Express error middleware
      asyncHandler.ts            Async controller error wrapper
      notFound.ts                404 middleware
      validate.ts                Zod request validation middleware
      index.ts                   Middleware exports
    requests/
      FormRequest.ts             Laravel-like request validation base
      TestRequest.ts             Example request schema
      index.ts                   Request exports
    resources/
      JsonResource.ts            Base API resource and collection support
      ResourceCollection.ts      Collection export
      TestResource.ts            Example response transformer
      index.ts                   Resource exports
  models/
    Post.ts                      Model-like Knex query class
  routes/
    api.ts                       API router root
    api/
      v1.ts                      Versioned API routes
```

## Path Aliases

Use configured aliases instead of long relative imports:

```text
@config/*
@database/*
@exceptions/*
@http/*
@models/*
@routes/*
```

Aliases are configured in `tsconfig.json` and rewritten during `npm run build` with `tsc-alias`.

## Error Handling

Expected HTTP errors should extend `HttpException`.

Standard JSON error shape:

```json
{
  "message": "Route not found",
  "status": 404
}
```

Unexpected production errors are rendered as:

```json
{
  "message": "Server Error",
  "status": 500
}
```

In development, unexpected errors include debug details.

## Request Validation

Request validation uses Zod behind a Laravel-like request convention.

Define request schemas under `src/http/requests/`, then attach them to routes with the exported `validate` middleware:

```ts
router.post("/test", validate(TestRequest), testController.store);
```

Validated data is available on `req.validated`. Validation failures return:

```json
{
  "message": "The given data was invalid.",
  "status": 422,
  "errors": {
    "name": ["Name is required"]
  }
}
```

## API Resources

Successful API responses can be shaped with Laravel-like resources under `src/http/resources/`.

Resources transform internal data into public JSON response data:

```ts
return res.status(201).json(
  TestResource.make({ name, fruit }).toResponse({
    message: "Test request validated.",
  })
);
```

Standard resource responses use:

```json
{
  "message": "Optional message",
  "data": {},
  "meta": {}
}
```

Collection responses can include pagination metadata:

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 0,
    "last_page": 1,
    "from": null,
    "to": null
  }
}
```

Post collections accept `page` and `per_page` query parameters.

## Database

Database access uses Knex with mysql2 for local and production MySQL. Tests use a separate SQLite database. Migrations and seeders live under `src/database/`.

Common commands:

```bash
npm run db:make:migration create_posts_table
npm run db:migrate
npm run db:rollback
npm run db:seed
npm run db:status
```

Read `docs/database.md` before adding models, migrations, relationships, or database-backed tests.

The configured MySQL user must have access to `DB_DATABASE`. The test database is a SQLite file configured by `TEST_DB_DATABASE`.

## Useful Commands

```bash
npm run dev           # Start development runtime
npm run build         # Compile TypeScript and rewrite aliases
npm run start         # Run compiled app from dist/
npm run db:migrate    # Run Knex migrations
npm run db:rollback   # Roll back the latest Knex migration batch
npm run boost         # Print project context
npm run boost:routes  # Print route registrations
npm run boost:doctor  # Check expected project files
npm run test          # Run Vitest feature tests
```

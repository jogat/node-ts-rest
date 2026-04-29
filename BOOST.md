# Project Boost

This project is an Express and TypeScript API shaped with Laravel-style conventions. Use this file as the project context entry point before making framework-level changes.

## Intent

- Keep the runtime Express-native.
- Prefer Laravel-inspired names and boundaries where they improve clarity.
- Centralize framework concerns such as configuration, routes, middleware, exceptions, validation, and auth.
- Avoid adding packages until a framework concern clearly needs one.

## Current Structure

- `src/app.ts` boots the server.
- `src/app/Server.ts` owns Express setup, global middleware, routes, and terminal exception middleware.
- `src/config/` contains environment-backed app configuration.
- `src/database/` contains Knex database connection, migrations, and seeders.
- `src/routes/` contains route registration.
- `src/http/controllers/` contains controller classes.
- `src/http/middleware/` contains Express middleware.
- `src/http/requests/` contains Laravel-like request validation classes.
- `src/http/resources/` contains Laravel-like API response transformers.
- `src/models/` contains model-like Knex query classes.
- `src/exceptions/` contains Laravel-like HTTP exception handling.

## Request Pipeline

The expected middleware order is:

1. Global middleware.
2. Routes.
3. `notFound` middleware.
4. `errorHandler` middleware.

Do not register route handlers after terminal exception middleware.

## Error Responses

Use `HttpException` for expected HTTP errors and allow unexpected errors to flow into `errorHandler`.

Expected JSON shape:

```json
{
  "message": "Route not found",
  "status": 404
}
```

In production, unexpected errors should render as:

```json
{
  "message": "Server Error",
  "status": 500
}
```

## Path Aliases

Use existing aliases instead of deep relative imports:

- `@config/*`
- `@database/*`
- `@exceptions/*`
- `@http/*`
- `@models/*`
- `@routes/*`

When adding a new top-level concern, update both `tsconfig.json` and verify `npm run build` so `tsc-alias` rewrites compiled imports.

## Commands

- `npm run dev` starts the TypeScript development runtime.
- `npm run build` compiles TypeScript and rewrites path aliases.
- `npm run start` runs the compiled app.
- `npm run boost` prints project context.
- `npm run boost:routes` prints route-oriented context.
- `npm run test` runs Vitest feature tests.
- `npm run db:migrate` runs Knex migrations.
- `npm run db:rollback` rolls back the latest Knex migration batch.
- `npm run db:status` lists Knex migration status.

## Conventions For Future Modules

- Controllers should stay thin and return JSON responses through resources when shaping API data.
- Middleware should be exported from `src/http/middleware/index.ts`.
- Async controllers should be wrapped with `asyncHandler` so errors flow into `errorHandler`.
- Route model binding should use `bindRouteModel("name", Model)` with model-like classes that expose `find(id)`.
- New expected HTTP errors should extend `HttpException`.
- Known database constraint errors should be mapped through `DatabaseExceptionMapper`.
- Validation uses Zod request classes and should plug into the centralized exception handler.
- API resources should transform internal data into public response shapes without adopting JSON:API.
- Paginated collections should expose metadata through the resource `meta` envelope.
- Database access uses Knex with mysql2 for local/production and sqlite3 for tests; fields and relationships belong in migrations.
- Model-like classes should expose explicit Knex query helpers instead of hidden ORM behavior.
- Auth schema uses `users` and `personal_access_tokens`; access tokens should be stored as hashes.
- Auth conventions live in `docs/auth.md`; API clients should use bearer tokens.
- Protected route groups should use the exported `auth` middleware.
- Authenticated controllers can use `AuthenticatedRequest` for `req.user` and `req.accessToken`.
- Test conventions live in `docs/testing.md`; tests use SQLite through `NODE_ENV=test`.
- Auth and service/container features should plug into the same route and exception boundaries.
- Keep generated JavaScript in `dist/` out of source control.

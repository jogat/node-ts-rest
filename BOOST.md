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
- `src/routes/` contains route registration.
- `src/http/controllers/` contains controller classes.
- `src/http/middleware/` contains Express middleware.
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
- `@exceptions/*`
- `@http/*`
- `@routes/*`

When adding a new top-level concern, update both `tsconfig.json` and verify `npm run build` so `tsc-alias` rewrites compiled imports.

## Commands

- `npm run dev` starts the TypeScript development runtime.
- `npm run build` compiles TypeScript and rewrites path aliases.
- `npm run start` runs the compiled app.
- `npm run boost` prints project context.
- `npm run boost:routes` prints route-oriented context.

## Conventions For Future Modules

- Controllers should stay thin and return JSON responses.
- Middleware should be exported from `src/http/middleware/index.ts`.
- New expected HTTP errors should extend `HttpException`.
- Validation, auth, and service/container features should plug into the centralized exception handler.
- Keep generated JavaScript in `dist/` out of source control.


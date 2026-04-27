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
```

Defaults are defined in `src/config/app.ts`.

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
GET /ws/v1/test    Test JSON response
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

At the moment, no test runner is configured. The current script is a placeholder and exits with an error. When tests are added, this command should become the standard test entrypoint.

## Project Structure

```text
src/
  app.ts                         Server bootstrap
  app/
    Server.ts                    Express app setup
  config/
    app.ts                       App env config
    cors.ts                      CORS config
    index.ts                     Config export
  exceptions/
    Handler.ts                   Central error renderer
    HttpException.ts             Base HTTP exception
    NotFoundException.ts         404 exception
  http/
    controllers/
      TestController.ts          Example controller
    middleware/
      errorHandler.ts            Express error middleware
      notFound.ts                404 middleware
      index.ts                   Middleware exports
  routes/
    api.ts                       API router root
    api/
      v1.ts                      Versioned API routes
```

## Path Aliases

Use configured aliases instead of long relative imports:

```text
@config/*
@exceptions/*
@http/*
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

## Useful Commands

```bash
npm run dev           # Start development runtime
npm run build         # Compile TypeScript and rewrite aliases
npm run start         # Run compiled app from dist/
npm run boost         # Print project context
npm run boost:routes  # Print route registrations
npm run boost:doctor  # Check expected project files
npm run test          # Run tests once configured
```


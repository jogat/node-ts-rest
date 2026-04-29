# Console Guide

This project uses a Laravel-like console layer built with `commander` and `@commander-js/extra-typings`.

## Entry Point

Run the console via the `artisan` npm script:

```bash
npm run artisan -- about
```

Available commands:

```bash
npm run artisan -- about
npm run artisan -- routes
npm run artisan -- hello
npm run artisan -- doctor
npm run artisan -- db status
npm run artisan -- db migrate
npm run artisan -- db rollback
npm run artisan -- db seed
```

## TypeScript Pattern

Use the typed Commander entrypoint:

```ts
import { Command } from "@commander-js/extra-typings";
```

Define options and arguments before the `.action()` handler so the inferred types remain strong.

## Current Commands

Example command modules live under `src/console/commands/`.
New commands must also be registered from `src/console/artisan.ts`.

### `about`

Prints project context, structure, aliases, scripts, and dependencies.

### `routes`

Prints discovered route registrations from `src/routes/`.

### `hello`

Prints `hello world`.

### `doctor`

Checks the expected project files and framework entrypoints.

### `db`

Provides database maintenance commands backed by the existing Knex configuration:

- `status`
- `migrate`
- `rollback`
- `seed`

## Adding A New Command

1. Create a new file under `src/console/commands/`.
2. Export a registrar function that accepts a Commander `Command` instance.
3. Register the new command in `src/console/artisan.ts`.
4. Add or update a unit test in `tests/unit/console.test.ts`.
5. Document the command in this file if it is part of the supported CLI surface.

Example command module:

```ts
import { Command } from "@commander-js/extra-typings";

export function registerHelloCommand(program: Command): void {
  program
    .command("hello")
    .description('Print "hello world"')
    .action(() => {
      console.log("hello world");
    });
}
```

## Notes

- `boost` remains as a compatibility wrapper around the shared console output.
- The console layer is additive; existing database scripts remain available.
- Future milestones for scheduled commands, queue workers, custom listeners, and production binaries are tracked under `milestones/`.

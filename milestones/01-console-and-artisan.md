# Console and Artisan-Style Commands

## Goal

Add a Laravel-like console layer for application maintenance, automation, and developer workflows.

## Why This Matters

The API already has the HTTP side of the stack. A console layer fills in the operational side: database tasks, maintenance commands, scheduled jobs, and one-off utilities.

## Scope

- Create a `src/console/` area for command classes.
- Add a command registration and boot process.
- Support named commands with arguments and options.
- Add an executable entrypoint for running commands locally.
- Provide a small set of built-in commands for common tasks.

## Good Initial Commands

- database status
- migrate
- rollback
- seed
- clear cache
- show routes
- show config

## Done When

- Commands can be registered and executed consistently.
- Command output is structured and readable.
- The console layer is documented for developers and AI tools.
- Routine maintenance tasks can be run without touching HTTP routes.


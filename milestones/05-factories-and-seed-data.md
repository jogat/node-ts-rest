# Factories and Seed-Data Ergonomics

## Goal

Make test and development data creation feel closer to Laravel factories and seeders.

## Why This Matters

The project already has migrations, seeders, and tests, but it still lacks a convenient way to create repeatable model data for tests and local development.

## Scope

- Add factory helpers for users, posts, and token records.
- Make fixture creation easy in feature and unit tests.
- Add reusable seeder composition for local development.
- Document how factories differ from migrations and seeders.

## Good First Use Cases

- create a user with overrides
- create a post for a given user
- create an access token for an authenticated test
- seed realistic development data quickly

## Done When

- Tests can create realistic data with minimal boilerplate.
- Seeders can reuse the same creation primitives as tests.
- Data creation stays explicit and does not hide database behavior.
- The docs explain where to use factories versus seeders.


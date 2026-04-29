# Factories and Seed-Data Ergonomics

## Goal

Make test and development data creation feel closer to Laravel factories and seeders.

## Why This Matters

The project already has migrations, seeders, and tests, but it still lacks a convenient way to create repeatable model data for tests and local development.

## Scope

- Add factory helpers for users, posts, and token records. Done.
- Make fixture creation easy in feature and unit tests. Done.
- Add reusable seeder composition for local development. Done.
- Document how factories differ from migrations and seeders. Done.

## Good First Use Cases

- create a user with overrides
- create a post for a given user
- create an access token for an authenticated test
- seed realistic development data quickly

## Current Implementation

- Fishery provides typed factory definitions.
- Faker generates realistic default data with a CommonJS-compatible version pinned for the current build.
- `userFactory`, `postFactory`, and `accessTokenFactory` expose `build` and `create` helpers.
- Factory `create` methods persist through existing model helpers and hashing utilities.
- Access token creation returns the stored token row and plain token for auth tests.
- `001_development` seeds users, posts, and a local development access token.

## Pending Work

- Add factory states such as admin users, published posts, draft posts, or expired tokens.
- Add after-create hooks for richer relationship graphs.
- Add scenario seeders for demos, QA, or performance testing.
- Add deterministic Faker seeding controls if tests need stable generated values across runs.
- Add factories for future models such as attachments, notifications, or jobs.

## Done When

- Tests can create realistic data with minimal boilerplate.
- Seeders can reuse the same creation primitives as tests.
- Data creation stays explicit and does not hide database behavior.
- The docs explain where to use factories versus seeders.

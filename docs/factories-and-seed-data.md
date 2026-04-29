# Factories and Seed Data

Factories create realistic model data for tests and local development. Seeders compose factories into a repeatable database state.

## Factories

Factories live in `src/database/factories` and are exported from `@database/factories`.

```ts
import { userFactory, postFactory, accessTokenFactory } from "@database/factories";
```

Use `build` when you need unsaved attributes:

```ts
const attributes = userFactory.build({
  email: "test@example.com",
});
```

Use `create` when you need persisted database rows:

```ts
const user = await userFactory.create();
const post = await postFactory.create({ title: "Hello" }, { user });
```

Access token factories return both the database row and the plain token:

```ts
const { token, plainTextToken } = await accessTokenFactory.create({}, { user });
```

Tests can use `plainTextToken` directly in an authorization header.

## Seeders

Seeders live in `src/database/seeders` and can reuse factories. Run them with:

```bash
npm run db:seed
```

or:

```bash
npm run artisan -- db seed
```

The development seeder resets users, posts, and personal access tokens before creating local sample data. It is intended for local development, not production data management.

## Factories vs. Seeders

Use factories when a test needs a small amount of explicit setup close to the assertion. Use seeders when local development needs a repeatable dataset with multiple related records.

Factories should keep database behavior visible. They call model creation helpers and return model row types rather than hiding persistence behind fixtures.

## Defaults

- User passwords default to `password123` and are hashed during `create`.
- Post factories can create an owner automatically when no user is supplied.
- Token factories hash the plain token and expose it for authentication tests.

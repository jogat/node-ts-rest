# Auth Guide

This project uses a Laravel Sanctum-inspired API token model. The backend is intended to serve web first, then mobile clients such as Flutter, iOS, and Android. All clients should share the same API auth contract.

## Overview

Auth is stateless for API clients. Clients authenticate by sending a bearer token:

```http
Authorization: Bearer <plain-token>
```

The server should never store the plain token. It stores a hash and compares incoming bearer tokens by hashing the received token.

## Client Model

The same auth contract should work for:

- web
- Flutter
- iOS
- Android

Sessions are not part of the current API auth plan. Cookie/session auth can be considered later if the web app needs it, but the default API guard should remain bearer-token based.

## Tables

Current auth schema:

```text
users
personal_access_tokens
```

Relationships:

```text
users has many personal_access_tokens
personal_access_tokens belongs to user
```

The `users` table stores identity and password hash data. The `personal_access_tokens` table stores API token metadata.

## Token Storage

Store only token hashes:

```text
token_hash
```

Do not store raw bearer tokens. A future login/register flow should return the plain token once, then only the hash remains in the database.

Token metadata should support multi-client usage:

```text
name
abilities
last_used_at
expires_at
revoked_at
```

Examples for `name`:

```text
Web Chrome
Josue's iPhone
Flutter Android
```

## Request Flow

Implemented `auth` middleware flow:

1. Read `Authorization` header.
2. Require `Bearer <token>`.
3. Hash the plain token.
4. Find `personal_access_tokens.token_hash`.
5. Reject revoked or expired tokens.
6. Load the owning user.
7. Attach authenticated user/token context to the request as `req.user` and `req.accessToken`.
8. Continue to the protected route.

Unauthenticated responses should use:

```json
{
  "message": "Unauthenticated.",
  "status": 401
}
```

## Protected Routes

Use Express routers as Laravel-like middleware groups:

```ts
const protectedRoutes = Router();

protectedRoutes.use(auth);
protectedRoutes.get("/posts", validate(ListPostsRequest), asyncHandler(postController.index));

router.use(protectedRoutes);
```

Middleware order should stay intentional:

```text
auth -> route model binding -> validation -> controller
```

## Current Guard

The current guard protects route groups but does not yet provide login/register endpoints. Tests create hashed tokens directly through the model-like classes.

## Planned Endpoints

Future auth endpoints:

```text
POST /v1/auth/register
POST /v1/auth/login
POST /v1/auth/logout
GET  /v1/auth/me
```

Post routes are protected through an auth middleware group. Test routes are public.

## Future Considerations

- Password hashing should use a trusted password hashing package.
- Token generation should use cryptographically secure random bytes.
- Token abilities can later support permission checks.
- `last_used_at` should be updated by the auth middleware.
- `revoked_at` should be set during logout.
- `expires_at` can be optional at first.

## AI Agent Notes

- Keep auth API-first and bearer-token based.
- Do not introduce sessions unless explicitly requested.
- Store only token hashes.
- Use `users` and `personal_access_tokens` for the auth schema.
- Keep web and mobile clients on the same backend auth contract.
- Auth middleware should attach both user and token context to the request.

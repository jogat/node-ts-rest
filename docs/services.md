# Services Guide

This project uses a lightweight application service layer to keep controllers thin and encapsulate business workflows.

## Purpose

Service classes are responsible for application-specific workflows that involve one or more models or shared domain logic.

Controllers should not implement business rules directly. Instead they should:

- read validated request data
- read authenticated request context and bound route models
- call a service method
- return a response through controller helpers

## Current services

- `AuthService` handles registration, login, and logout workflows.
- `PostService` handles listing, creating, updating, and deleting posts.

## Dependency container

A simple `ServiceContainer` exists to register and resolve shared service instances.

Use the container in route setup to assemble services once and inject them into controllers.

## Example service usage

```ts
const serviceContainer = new ServiceContainer();
serviceContainer.register(AuthService, new AuthService());
serviceContainer.register(PostService, new PostService());

const authController = new AuthController(serviceContainer.resolve(AuthService));
const postController = new PostController(serviceContainer.resolve(PostService));
```

## Service responsibilities

### `AuthService`

- hash passwords during registration
- verify passwords during login
- create personal access tokens
- revoke tokens during logout

### `PostService`

- paginate post listings
- create posts for the authenticated user
- update posts with validated input
- delete posts by ID

## Notes

Keep authorization in middleware and route policy checks.
Keep response shaping in resources and controller helpers.

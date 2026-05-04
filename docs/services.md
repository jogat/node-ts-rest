# Services Guide

This project uses a lightweight application service layer to keep controllers thin and encapsulate business workflows.

## Purpose

Service classes are responsible for application-specific workflows that involve one or more models or shared domain logic.

For larger workflows with several ordered stages, use the planned pipeline layer from `milestones/14-laravel-inspired-pipelines.md` and keep services focused on cohesive business operations.

Controllers should not implement business rules directly. Instead they should:

- read validated request data
- read authenticated request context and bound route models
- call a service method
- return a response through controller helpers

## Current services

- `AuthService` handles registration, login, and logout workflows.
- `PostService` handles listing, creating, updating, and deleting posts.

Pipeline usage and the planned local implementation are documented in `docs/pipelines.md`.

## Dependency container

A simple `ServiceContainer` exists to register and resolve shared service instances.

Use the container in route setup to assemble services once and inject them into controllers.

## Example service usage

```ts
const serviceContainer = new ServiceContainer();
const eventDispatcher = new EventDispatcher();

serviceContainer.register(EventDispatcher, eventDispatcher);
serviceContainer.register(AuthService, new AuthService(eventDispatcher));
serviceContainer.register(PostService, new PostService(eventDispatcher));

const authController = new AuthController(serviceContainer.resolve(AuthService));
const postController = new PostController(serviceContainer.resolve(PostService));
```

## Service responsibilities

### `AuthService`

- hash passwords during registration
- verify passwords during login
- create personal access tokens
- revoke tokens during logout
- dispatch user registration and login events after successful workflows

### `PostService`

- paginate post listings
- create posts for the authenticated user
- update posts with validated input
- delete posts by ID
- dispatch post creation and update events after successful writes

## Notes

Keep authorization in middleware and route policy checks.
Keep response shaping in resources and controller helpers.
Use pipelines when a service workflow grows into an ordered, stage-based process with shared mutable payload state.

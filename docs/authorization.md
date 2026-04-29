# Authorization Guide

This project uses Laravel-like policies for authorization. Authentication identifies the user. Authorization decides whether that user may perform an action.

## Overview

Policies live under `src/policies/` and expose action methods such as:

```ts
create(user)
update(user, model)
delete(user, model)
```

Policy middleware lives in `src/http/middleware/authorize.ts`.

Unauthorized responses use:

```json
{
  "message": "This action is unauthorized.",
  "status": 403
}
```

## Route Usage

Use policies after authentication. For model-specific actions, bind the route model first:

```ts
router.patch(
  "/posts/:post",
  bindRouteModel("post", Post),
  authorize(PostPolicy, "update", "post"),
  validate(UpdatePostRequest),
  asyncHandler(postController.update)
);
```

Recommended middleware order:

```text
auth -> route model binding -> authorize -> validation -> controller
```

## Post Policy

Current Post rules:

```text
Authenticated users may create posts.
Only the owner may update a post.
Only the owner may delete a post.
Authenticated users may view posts.
```

Post ownership is stored in:

```text
posts.user_id
```

## AI Agent Notes

- Add policies under `src/policies/`.
- Add policy checks in routes, not controllers.
- Keep controllers focused on request data and responses.
- Use `403` for authenticated users who cannot perform an action.
- Use `401` only when the user is unauthenticated.
- Bind route models before authorizing model-specific actions.

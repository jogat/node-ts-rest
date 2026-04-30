# Controller Guide

Controllers live in `src/http/controllers/` and should stay thin. They read validated request data, call model or service code, and return responses through the base `Controller` helpers.

## Base Controller

Extend `Controller` when adding a controller:

```ts
import { Request, Response } from "express";
import { Controller } from "@http/controllers/Controller";
import { PostResource } from "@http/resources";
import { Post } from "@models/Post";

export class PostController extends Controller {
  show = async (req: Request, res: Response) => {
    const post = await Post.find(1);

    return this.resource(res, PostResource.make(post));
  };
}
```

Controller actions should be arrow properties when they use `this`. Routes pass controller actions directly to Express, so arrow properties preserve the controller instance.

## Response Helpers

Available helpers:

```ts
this.json(res, body);
this.data(res, data);
this.created(res, data);
this.resource(res, UserResource.make(user));
this.createdResource(res, PostResource.make(post), { message: "Post created." });
this.collection(res, JsonResource.collection(posts.data, PostResource), { meta: posts.meta });
this.noContent(res);
```

Use `json` only for intentionally custom responses. For API data, prefer `data`, `resource`, or `collection` so responses keep the standard envelope.

Standard resource response:

```json
{
  "data": {}
}
```

Resource response with a message:

```json
{
  "message": "Post created.",
  "data": {}
}
```

Collection response with metadata:

```json
{
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 0,
    "last_page": 1,
    "from": null,
    "to": null
  }
}
```

## Request Data

Validated request data lives on `req.validated` after the `validate` middleware runs:

```ts
const data = (req as StorePostRequest).validated.body;
```

Authenticated request data lives on `req.user` and `req.accessToken` after the `auth` middleware runs:

```ts
const { user } = req as AuthenticatedRequest;
```

Bound route models live on `req.models` after `bindRouteModel` or `bindRouteSlugModel` runs:

```ts
const post = (req as BoundPostRequest).models.post;
```

## Route Usage

Wrap async controller actions with `asyncHandler` so thrown errors flow into the centralized exception handler:

```ts
router.post("/posts", validate(StorePostRequest), asyncHandler(postController.store));
```

Recommended controller action flow:

```text
validated request data -> model/service call -> resource response
```

## AI Agent Notes

- Keep route authorization in middleware, not inside controllers.
- Keep response shaping in resources, not inline inside controllers.
- Use `noContent` for successful delete/logout responses.
- Use `created` or `createdResource` for `201` responses.
- Do not manually build pagination envelopes in controllers; pass metadata to `collection`.

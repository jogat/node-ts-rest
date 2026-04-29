# Routing Guide

This project keeps routing Express-native while using Laravel-like conventions for route groups, middleware order, model binding, and reusable route parameter rules.

## Route Groups

Use Express routers to group related middleware:

```ts
const protectedRoutes = Router();

protectedRoutes.use("/posts", auth);
protectedRoutes.get("/posts", validate(ListPostsRequest), asyncHandler(postController.index));

router.use(protectedRoutes);
```

## Middleware Order

Recommended order for protected model routes:

```text
auth -> route model binding -> authorize -> validation -> controller
```

## Route Model Binding

Use `bindRouteModel("name", Model)` for Laravel-like model binding:

```ts
router.get("/posts/:post", bindRouteModel("post", Post), asyncHandler(postController.show));
```

The model-like class must expose:

```ts
static find(id: number): Promise<Row | undefined>
```

The bound model is available on:

```ts
req.models.post
```

Invalid params and missing records return `404`, matching Laravel-style model binding behavior:

```json
{
  "message": "Post not found",
  "status": 404
}
```

## Route Params

Reusable route param helpers live in:

```text
src/http/requests/routeParams.ts
```

Use `routeParams.positiveInteger("post")` when a request schema needs explicit param validation:

```ts
const commentParamsSchema = z.object({
  post: routeParams.positiveInteger("post"),
  comment: routeParams.positiveInteger("comment"),
});
```

Distinction:

```text
model binding invalid param -> 404
explicit request validation invalid param -> 422
```

## AI Agent Notes

- Keep route groups Express-native with `Router`.
- Prefer `bindRouteModel` for routes that load database records.
- Reuse `routeParams` helpers in request schemas.
- Preserve middleware order when combining auth, model binding, authorization, validation, and controllers.

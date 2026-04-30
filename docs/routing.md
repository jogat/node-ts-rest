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

## Scoped Route Modules

Keep v1 routes split by concern so each module owns a small area of the API:

```text
src/routes/api/v1/auth.ts
src/routes/api/v1/posts.ts
src/routes/api/v1/index.ts
```

Use `src/routes/api/v1/index.ts` as the composition point that wires shared controllers and mounts the scoped route registrars. This keeps auth and post routes isolated without changing public API paths.

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

## Slug Binding

Use `bindRouteSlugModel("name", Model)` when the route should resolve a record by a slug instead of a numeric id:

```ts
router.get("/posts/slug/:slug", bindRouteSlugModel("post", Post), asyncHandler(postController.show));
```

The middleware reuses the same `req.models.post` storage pattern, so controllers can stay unchanged. It is meant to be reusable for any model that exposes:

```ts
static findBySlug(slug: string): Promise<Row | undefined>
```

This keeps the route binding pattern consistent while allowing future slug-based model lookups.

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
- Prefer `bindRouteSlugModel` for slug-based lookups that should still populate `req.models`.
- Reuse `routeParams` helpers in request schemas.
- Preserve middleware order when combining auth, model binding, authorization, validation, and controllers.

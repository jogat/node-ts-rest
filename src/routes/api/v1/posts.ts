import { Router } from "express";
import { PostController } from "@http/controllers/PostController";
import { asyncHandler, auth, authorize, bindRouteModel, bindRouteSlugModel, validate } from "@http/middleware";
import { ListPostsRequest, StorePostRequest, UpdatePostRequest } from "@http/requests";
import { Post } from "@models/Post";
import { PostPolicy } from "@policies/PostPolicy";

export function registerPostRoutes(router: Router, postController: PostController): void {
  router.use("/posts", auth);
  router.get("/posts", validate(ListPostsRequest), asyncHandler(postController.index));
  router.post("/posts", authorize(PostPolicy, "create"), validate(StorePostRequest), asyncHandler(postController.store));
  router.get("/posts/slug/:slug", bindRouteSlugModel("post", Post), asyncHandler(postController.show));
  router.get("/posts/:post", bindRouteModel("post", Post), asyncHandler(postController.show));
  router.patch(
    "/posts/:post",
    bindRouteModel("post", Post),
    authorize(PostPolicy, "update", "post"),
    validate(UpdatePostRequest),
    asyncHandler(postController.update)
  );
  router.delete("/posts/:post", bindRouteModel("post", Post), authorize(PostPolicy, "delete", "post"), asyncHandler(postController.destroy));
}

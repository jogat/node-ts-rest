import { Router } from "express";
import { PostController } from "@http/controllers/PostController";
import { TestController } from "@http/controllers/TestController";
import { asyncHandler, auth, bindRouteModel, validate } from "@http/middleware";
import { ListPostsRequest, StorePostRequest, TestRequest, UpdatePostRequest } from "@http/requests";
import { Post } from "@models/Post";

const router = Router();
const protectedRoutes = Router();
const postController = new PostController();
const testController = new TestController();

protectedRoutes.use("/posts", auth);
protectedRoutes.get("/posts", validate(ListPostsRequest), asyncHandler(postController.index));
protectedRoutes.post("/posts", validate(StorePostRequest), asyncHandler(postController.store));
protectedRoutes.get("/posts/:post", bindRouteModel("post", Post), asyncHandler(postController.show));
protectedRoutes.patch("/posts/:post", bindRouteModel("post", Post), validate(UpdatePostRequest), asyncHandler(postController.update));
protectedRoutes.delete("/posts/:post", bindRouteModel("post", Post), asyncHandler(postController.destroy));

router.get("/test", testController.index);
router.post("/test", validate(TestRequest), testController.store);
router.use(protectedRoutes);

export default router;

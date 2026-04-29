import { Router } from "express";
import { AuthController } from "@http/controllers/AuthController";
import { PostController } from "@http/controllers/PostController";
import { TestController } from "@http/controllers/TestController";
import { asyncHandler, auth, authorize, bindRouteModel, validate } from "@http/middleware";
import { ListPostsRequest, LoginRequest, RegisterRequest, StorePostRequest, TestRequest, UpdatePostRequest } from "@http/requests";
import { Post } from "@models/Post";
import { PostPolicy } from "@policies/PostPolicy";
import { AuthService, PostService, ServiceContainer } from "@services";

const router = Router();
const protectedRoutes = Router();

const serviceContainer = new ServiceContainer();
serviceContainer.register(AuthService, new AuthService());
serviceContainer.register(PostService, new PostService());

const authController = new AuthController(serviceContainer.resolve(AuthService));
const postController = new PostController(serviceContainer.resolve(PostService));
const testController = new TestController();

protectedRoutes.use("/posts", auth);
protectedRoutes.get("/posts", validate(ListPostsRequest), asyncHandler(postController.index));
protectedRoutes.post("/posts", authorize(PostPolicy, "create"), validate(StorePostRequest), asyncHandler(postController.store));
protectedRoutes.get("/posts/:post", bindRouteModel("post", Post), asyncHandler(postController.show));
protectedRoutes.patch(
  "/posts/:post",
  bindRouteModel("post", Post),
  authorize(PostPolicy, "update", "post"),
  validate(UpdatePostRequest),
  asyncHandler(postController.update)
);
protectedRoutes.delete("/posts/:post", bindRouteModel("post", Post), authorize(PostPolicy, "delete", "post"), asyncHandler(postController.destroy));
protectedRoutes.get("/auth/me", auth, asyncHandler(authController.me));
protectedRoutes.post("/auth/logout", auth, asyncHandler(authController.logout));

router.post("/auth/register", validate(RegisterRequest), asyncHandler(authController.register));
router.post("/auth/login", validate(LoginRequest), asyncHandler(authController.login));
router.get("/test", testController.index);
router.post("/test", validate(TestRequest), testController.store);
router.use(protectedRoutes);

export default router;

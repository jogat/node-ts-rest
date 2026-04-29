import { Router } from "express";
import { AuthController } from "@http/controllers/AuthController";
import { PostController } from "@http/controllers/PostController";
import { TestController } from "@http/controllers/TestController";
import { asyncHandler, auth, bindRouteModel, validate } from "@http/middleware";
import { ListPostsRequest, LoginRequest, RegisterRequest, StorePostRequest, TestRequest, UpdatePostRequest } from "@http/requests";
import { Post } from "@models/Post";

const router = Router();
const protectedRoutes = Router();
const authController = new AuthController();
const postController = new PostController();
const testController = new TestController();

protectedRoutes.use("/posts", auth);
protectedRoutes.get("/posts", validate(ListPostsRequest), asyncHandler(postController.index));
protectedRoutes.post("/posts", validate(StorePostRequest), asyncHandler(postController.store));
protectedRoutes.get("/posts/:post", bindRouteModel("post", Post), asyncHandler(postController.show));
protectedRoutes.patch("/posts/:post", bindRouteModel("post", Post), validate(UpdatePostRequest), asyncHandler(postController.update));
protectedRoutes.delete("/posts/:post", bindRouteModel("post", Post), asyncHandler(postController.destroy));
protectedRoutes.get("/auth/me", auth, asyncHandler(authController.me));
protectedRoutes.post("/auth/logout", auth, asyncHandler(authController.logout));

router.post("/auth/register", validate(RegisterRequest), asyncHandler(authController.register));
router.post("/auth/login", validate(LoginRequest), asyncHandler(authController.login));
router.get("/test", testController.index);
router.post("/test", validate(TestRequest), testController.store);
router.use(protectedRoutes);

export default router;

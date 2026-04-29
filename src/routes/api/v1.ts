import { Router } from "express";
import { AuthController } from "@http/controllers/AuthController";
import { PostController } from "@http/controllers/PostController";
import { TestController } from "@http/controllers/TestController";
import { asyncHandler, auth, authorize, bindRouteModel, validate } from "@http/middleware";
import { ListPostsRequest, LoginRequest, RegisterRequest, StorePostRequest, TestRequest, UpdatePostRequest } from "@http/requests";
import { EventDispatcher } from "@events";
import { registerEventListeners } from "@listeners";
import { Post } from "@models/Post";
import { InMemoryNotificationChannel, Notifier, QueuedMailNotificationChannel } from "@notifications";
import { PostPolicy } from "@policies/PostPolicy";
import { createQueueDispatcher } from "@queue";
import { AuthService, PostService, ServiceContainer } from "@services";

const router = Router();
const protectedRoutes = Router();

const serviceContainer = new ServiceContainer();
const eventDispatcher = new EventDispatcher();
const notificationChannel = new InMemoryNotificationChannel();
const queueDispatcher = createQueueDispatcher();
const mailNotificationChannel = new QueuedMailNotificationChannel(queueDispatcher);
const notifier = new Notifier([notificationChannel, mailNotificationChannel]);

registerEventListeners(eventDispatcher, notifier);

serviceContainer.register(EventDispatcher, eventDispatcher);
serviceContainer.register(InMemoryNotificationChannel, notificationChannel);
serviceContainer.register(Notifier, notifier);
serviceContainer.register(AuthService, new AuthService(serviceContainer.resolve(EventDispatcher)));
serviceContainer.register(PostService, new PostService(serviceContainer.resolve(EventDispatcher)));

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

import { Router } from "express";
import { config } from "@config/index";
import { EventDispatcher } from "@events";
import { registerEventListeners } from "@listeners";
import { InMemoryNotificationChannel, Notifier, QueuedMailNotificationChannel } from "@notifications";
import { TestController } from "@http/controllers/TestController";
import { UploadController } from "@http/controllers/UploadController";
import { asyncHandler, auth, uploadSingle, validate, validateUploadedFile } from "@http/middleware";
import { TestRequest } from "@http/requests";
import { AuthController } from "@http/controllers/AuthController";
import { PostController } from "@http/controllers/PostController";
import { AuthService, PostService, ServiceContainer, SlugService } from "@services";
import { createQueueDispatcher } from "@queue";
import { registerAuthRoutes } from "@routes/api/v1/auth";
import { registerPostRoutes } from "@routes/api/v1/posts";

const router = Router();

const serviceContainer = new ServiceContainer();
const notificationChannel = new InMemoryNotificationChannel();
const queueDispatcher = createQueueDispatcher();
const eventDispatcher = new EventDispatcher(queueDispatcher);
const mailNotificationChannel = new QueuedMailNotificationChannel(queueDispatcher);
const notifier = new Notifier([notificationChannel, mailNotificationChannel]);

registerEventListeners(eventDispatcher, notifier);

serviceContainer.register(EventDispatcher, eventDispatcher);
serviceContainer.register(InMemoryNotificationChannel, notificationChannel);
serviceContainer.register(Notifier, notifier);
serviceContainer.register(AuthService, new AuthService(serviceContainer.resolve(EventDispatcher)));
serviceContainer.register(SlugService, new SlugService());
serviceContainer.register(
  PostService,
  new PostService(serviceContainer.resolve(EventDispatcher), serviceContainer.resolve(SlugService))
);

const authController = new AuthController(serviceContainer.resolve(AuthService));
const postController = new PostController(serviceContainer.resolve(PostService));
const testController = new TestController();
const uploadController = new UploadController();

registerAuthRoutes(router, authController);
registerPostRoutes(router, postController);

router.get("/test", testController.index);
router.post("/test", validate(TestRequest), testController.store);
router.post(
  "/uploads/avatar",
  auth,
  uploadSingle("avatar"),
  validateUploadedFile("avatar", {
    required: true,
    image: true,
    mimeTypes: config.storage.upload.avatar.mimeTypes,
    extensions: config.storage.upload.avatar.extensions,
    maxSize: config.storage.upload.maxFileSize,
  }),
  asyncHandler(uploadController.storeAvatar)
);

export default router;

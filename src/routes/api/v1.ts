import { Router } from "express";
import { PostController } from "@http/controllers/PostController";
import { TestController } from "@http/controllers/TestController";
import { asyncHandler, validate } from "@http/middleware";
import { StorePostRequest, TestRequest, UpdatePostRequest } from "@http/requests";

const router = Router();
const postController = new PostController();
const testController = new TestController();

router.get("/posts", asyncHandler(postController.index));
router.post("/posts", validate(StorePostRequest), asyncHandler(postController.store));
router.get("/posts/:id", asyncHandler(postController.show));
router.patch("/posts/:id", validate(UpdatePostRequest), asyncHandler(postController.update));
router.delete("/posts/:id", asyncHandler(postController.destroy));

router.get("/test", testController.index);
router.post("/test", validate(TestRequest), testController.store);

export default router;

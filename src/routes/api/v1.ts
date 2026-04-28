import { Router } from "express";
import { TestController } from "@http/controllers/TestController";
import { validate } from "@http/middleware";
import { TestRequest } from "@http/requests";

const router = Router();
const testController = new TestController();

router.get("/test", testController.index);
router.post("/test", validate(TestRequest), testController.store);

export default router;

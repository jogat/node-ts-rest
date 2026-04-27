import { Router } from "express";
import { TestController } from "@http/controllers/TestController";

const router = Router();
const testController = new TestController();

router.get("/test", testController.index);

export default router;

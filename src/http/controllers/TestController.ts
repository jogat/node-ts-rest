import { Request, Response } from "express";

export class TestController {
  index(req: Request, res: Response) {
    res.json({
      fruits: ["apple", "bannana", "grape"],
    });
  }
}

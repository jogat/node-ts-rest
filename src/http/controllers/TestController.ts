import { Request, Response } from "express";
import { TestRequestData, ValidatedRequest } from "@http/requests";
import { TestResource } from "@http/resources";

type StoreTestRequest = ValidatedRequest<{
  body: TestRequestData;
}>;

export class TestController {
  index(req: Request, res: Response) {
    res.json({
      fruits: ["apple", "bannana", "grape"],
    });
  }

  store(req: Request, res: Response) {
    const { name, fruit } = (req as StoreTestRequest).validated.body;

    res.status(201).json(
      TestResource.make({ name, fruit }).toResponse({
        message: "Test request validated.",
      })
    );
  }
}

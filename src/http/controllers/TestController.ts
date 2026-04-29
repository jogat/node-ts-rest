import { Request, Response } from "express";
import { Controller } from "@http/controllers/Controller";
import { TestRequestData, ValidatedRequest } from "@http/requests";
import { TestResource } from "@http/resources";

type StoreTestRequest = ValidatedRequest<{
  body: TestRequestData;
}>;

export class TestController extends Controller {
  index = (req: Request, res: Response) => {
    return this.json(res, {
      fruits: ["apple", "bannana", "grape"],
    });
  };

  store = (req: Request, res: Response) => {
    const { name, fruit } = (req as StoreTestRequest).validated.body;

    return this.createdResource(
      res,
      TestResource.make({ name, fruit }),
      {
        message: "Test request validated.",
      }
    );
  };
}

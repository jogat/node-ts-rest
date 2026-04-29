import { NextFunction, Request, RequestHandler, Response } from "express";
import { NotFoundException } from "@exceptions/NotFoundException";
import { routeParams } from "@http/requests";

type RouteModel<TModel> = {
  find(id: number): Promise<TModel | undefined>;
};

export const bindRouteModel = <TModel>(name: string, model: RouteModel<TModel>): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = routeParams.positiveInteger(name).safeParse(req.params[name]);

      if (!result.success) {
        throw new NotFoundException(`${formatModelName(name)} not found`);
      }

      const record = await model.find(result.data);

      if (!record) {
        throw new NotFoundException(`${formatModelName(name)} not found`);
      }

      req.models = {
        ...(req.models ?? {}),
        [name]: record,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

function formatModelName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

declare global {
  namespace Express {
    interface Request {
      models?: Record<string, unknown>;
    }
  }
}

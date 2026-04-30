import { NextFunction, Request, RequestHandler, Response } from "express";
import { NotFoundException } from "@exceptions/NotFoundException";
import { routeParams } from "@http/requests";

type RouteParser<TValue> = {
  safeParse(value: string): { success: true; data: TValue } | { success: false };
};

type RouteModelFinder<TValue, TModel> = {
  find(value: TValue): Promise<TModel | undefined>;
};

type RouteBinding<TValue, TModel> = {
  paramName: string;
  parser: RouteParser<TValue>;
  find: (value: TValue) => Promise<TModel | undefined>;
};

export const bindRouteModelBy = <TValue, TModel>(name: string, binding: RouteBinding<TValue, TModel>): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = binding.parser.safeParse(req.params[binding.paramName]);

      if (!result.success) {
        throw new NotFoundException(`${formatModelName(name)} not found`);
      }

      const record = await binding.find(result.data);

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

export const bindRouteModel = <TModel>(name: string, model: RouteModelFinder<number, TModel>): RequestHandler => {
  return bindRouteModelBy(name, {
    paramName: name,
    parser: routeParams.positiveInteger(name),
    find: (id) => model.find(id),
  });
};

export const bindRouteSlugModel = <TModel>(name: string, model: { findBySlug(slug: string): Promise<TModel | undefined> }): RequestHandler => {
  return bindRouteModelBy(name, {
    paramName: "slug",
    parser: routeParams.slug("slug"),
    find: (slug) => model.findBySlug(slug),
  });
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

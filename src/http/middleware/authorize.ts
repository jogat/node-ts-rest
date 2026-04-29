import { NextFunction, Request, RequestHandler, Response } from "express";
import { ForbiddenException } from "@exceptions/ForbiddenException";
import { UnauthorizedException } from "@exceptions/UnauthorizedException";

type Policy = object;
type PolicyMethod = (...args: any[]) => boolean;
type PolicyConstructor = new () => Policy;

export const authorize = (Policy: PolicyConstructor, ability: string, modelName?: string): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      next(new UnauthorizedException());
      return;
    }

    const policy = new Policy();
    const method = (policy as Record<string, unknown>)[ability];

    if (typeof method !== "function") {
      next(new ForbiddenException());
      return;
    }

    const model = modelName ? req.models?.[modelName] : undefined;
    const policyMethod = method as PolicyMethod;
    const allowed = modelName ? policyMethod.call(policy, user, model) : policyMethod.call(policy, user);

    if (!allowed) {
      next(new ForbiddenException());
      return;
    }

    next();
  };
};

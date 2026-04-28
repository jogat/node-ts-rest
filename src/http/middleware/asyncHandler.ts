import { NextFunction, Request, RequestHandler, Response } from "express";

export const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
};

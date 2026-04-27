import { ErrorRequestHandler } from "express";
import { Handler } from "@exceptions/Handler";

const exceptionHandler = new Handler();

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  exceptionHandler.render(error, req, res);
};

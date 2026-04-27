import { Request, Response } from "express";
import { config } from "@config/index";
import { HttpException } from "@exceptions/HttpException";

type ErrorResponse = {
  message: string;
  status: number;
  details?: unknown;
};

export class Handler {
  render(error: unknown, req: Request, res: Response): Response {
    const exception = this.normalize(error);
    const response: ErrorResponse = {
      message: exception.message,
      status: exception.statusCode,
    };

    if (exception.details !== undefined) {
      response.details = exception.details;
    }

    return res.status(exception.statusCode).json(response);
  }

  private normalize(error: unknown): HttpException {
    if (error instanceof HttpException) {
      return error;
    }

    if (config.app.isProduction) {
      return new HttpException(500, "Server Error");
    }

    if (error instanceof Error) {
      return new HttpException(500, error.message || "Server Error", {
        name: error.name,
        stack: error.stack,
      });
    }

    return new HttpException(500, "Server Error", {
      error,
    });
  }
}

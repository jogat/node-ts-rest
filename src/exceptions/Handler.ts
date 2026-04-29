import { Request, Response } from "express";
import { config } from "@config/index";
import { DatabaseExceptionMapper } from "@exceptions/DatabaseExceptionMapper";
import { HttpException } from "@exceptions/HttpException";
import { ValidationException } from "@exceptions/ValidationException";

type ErrorResponse = {
  message: string;
  status: number;
  details?: unknown;
  errors?: Record<string, string[]>;
};

export class Handler {
  private databaseExceptionMapper = new DatabaseExceptionMapper();

  render(error: unknown, req: Request, res: Response): Response {
    const exception = this.normalize(error);
    const response: ErrorResponse = {
      message: exception.message,
      status: exception.statusCode,
    };

    if (exception.details !== undefined) {
      response.details = exception.details;
    }

    if (exception instanceof ValidationException) {
      response.errors = exception.errors;
    }

    return res.status(exception.statusCode).json(response);
  }

  private normalize(error: unknown): HttpException {
    if (error instanceof HttpException) {
      return error;
    }

    const databaseException = this.databaseExceptionMapper.map(error);

    if (databaseException) {
      return databaseException;
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

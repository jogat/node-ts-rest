import { NextFunction, Request, RequestHandler, Response } from "express";
import { z, ZodError } from "zod";
import { ValidationException, ValidationErrors } from "@exceptions/ValidationException";
import {
  FormRequest,
  FormRequestConstructor,
  RequestValidationSchemas,
  ValidatedData,
  ValidationSource,
} from "@http/requests";

type ValidationTarget = RequestValidationSchemas | FormRequest | FormRequestConstructor;

const sources: ValidationSource[] = ["params", "query", "body"];

export const validate = (target: ValidationTarget): RequestHandler => {
  const schemas = resolveSchemas(target);

  return (req: Request, res: Response, next: NextFunction) => {
    const validated: ValidatedData = {};
    const errors: ValidationErrors = {};

    for (const source of sources) {
      const schema = schemas[source];

      if (!schema) {
        continue;
      }

      const result = schema.safeParse(req[source]);

      if (result.success) {
        validated[source] = result.data;
        continue;
      }

      mergeErrors(errors, formatErrors(result.error, source));
    }

    if (Object.keys(errors).length > 0) {
      next(new ValidationException(errors));
      return;
    }

    req.validated = validated;
    next();
  };
};

function resolveSchemas(target: ValidationTarget): RequestValidationSchemas {
  if (target instanceof FormRequest) {
    return target.rules();
  }

  if (typeof target === "function") {
    return new target().rules();
  }

  return target;
}

function formatErrors(error: ZodError, source: ValidationSource): ValidationErrors {
  return error.issues.reduce<ValidationErrors>((errors, issue) => {
    const path = issue.path.map(String).join(".");
    const field = formatField(source, path);

    errors[field] = errors[field] ?? [];
    errors[field].push(issue.message);

    return errors;
  }, {});
}

function formatField(source: ValidationSource, path: string): string {
  if (source === "body") {
    return path || "body";
  }

  return path ? `${source}.${path}` : source;
}

function mergeErrors(target: ValidationErrors, source: ValidationErrors): void {
  for (const [field, messages] of Object.entries(source)) {
    target[field] = [...(target[field] ?? []), ...messages];
  }
}

declare global {
  namespace Express {
    interface Request {
      validated?: ValidatedData;
    }
  }
}

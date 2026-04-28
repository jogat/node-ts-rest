import { HttpException } from "@exceptions/HttpException";

export type ValidationErrors = Record<string, string[]>;

export class ValidationException extends HttpException {
  errors: ValidationErrors;

  constructor(errors: ValidationErrors, message = "The given data was invalid.") {
    super(422, message);

    this.errors = errors;
  }
}

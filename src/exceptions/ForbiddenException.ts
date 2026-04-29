import { HttpException } from "@exceptions/HttpException";

export class ForbiddenException extends HttpException {
  constructor(message = "This action is unauthorized.", details?: unknown) {
    super(403, message, details);
  }
}

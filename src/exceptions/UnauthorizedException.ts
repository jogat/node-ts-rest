import { HttpException } from "@exceptions/HttpException";

export class UnauthorizedException extends HttpException {
  constructor(message = "Unauthenticated.", details?: unknown) {
    super(401, message, details);
  }
}

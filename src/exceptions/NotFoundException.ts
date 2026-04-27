import { HttpException } from "@exceptions/HttpException";

export class NotFoundException extends HttpException {
  constructor(message = "Route not found", details?: unknown) {
    super(404, message, details);
  }
}

import { HttpException } from "@exceptions/HttpException";

export class ConflictException extends HttpException {
  constructor(message: string, details?: unknown) {
    super(409, message, details);
  }
}

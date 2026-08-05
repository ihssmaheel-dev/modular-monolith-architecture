import { HttpException, HttpStatus } from "@nestjs/common";
import { ZodError } from "zod";

export class ZodValidationException extends HttpException {
  constructor(public readonly zodError: ZodError) {
    super("Validation failed", HttpStatus.BAD_REQUEST);
  }
}

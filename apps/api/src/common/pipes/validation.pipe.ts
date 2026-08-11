import { PipeTransform, Injectable } from "@nestjs/common";
import { ZodSchema } from "zod";
import { ZodValidationException } from "../exceptions/zod-validation.exception";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new ZodValidationException(result.error);
    }
    return result.data;
  }
}

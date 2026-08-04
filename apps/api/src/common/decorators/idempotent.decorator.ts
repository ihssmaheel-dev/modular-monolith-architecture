import { SetMetadata } from "@nestjs/common";

export const IDEMPOTENT_KEY = "isIdempotent";

/**
 * Marks an endpoint as requiring an Idempotency-Key header.
 * The IdempotencyInterceptor will enforce this and prevent duplicate processing.
 */
export const Idempotent = () => SetMetadata(IDEMPOTENT_KEY, true);

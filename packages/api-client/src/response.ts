import { ApiErrorEnvelopeSchema, type ApiErrorEnvelope } from "@repo/contracts";

export function invalidResponseError(): ApiErrorEnvelope {
  return {
    code: "INVALID_RESPONSE",
    i18nKey: "api.error.responseValidationFailed",
    message: "api.error.responseValidationFailed",
    status: 502,
    requestId: "client",
    fieldErrors: {},
  };
}

export function parseError(value: unknown): ApiErrorEnvelope | undefined {
  const direct = ApiErrorEnvelopeSchema.safeParse(value);
  if (direct.success) return direct.data;
  if (typeof value === "object" && value !== null && "data" in value) {
    const nested = ApiErrorEnvelopeSchema.safeParse(value.data);
    if (nested.success) return nested.data;
  }
  return undefined;
}

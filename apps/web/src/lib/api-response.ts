export function getResponseMessage(value: unknown): string | null {
  if (typeof value !== "object" || value === null || !("message" in value)) return null;
  return typeof value.message === "string" ? value.message : null;
}

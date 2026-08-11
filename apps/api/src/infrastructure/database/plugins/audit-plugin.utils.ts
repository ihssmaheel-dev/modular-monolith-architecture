const SENSITIVE_FIELDS = new Set(["passwordHash", "passwordResetTokenHash"]);

export function getTenantId(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null || !("tenantId" in value)) return undefined;
  return typeof value.tenantId === "string" ? value.tenantId : undefined;
}

export function sanitizeAuditValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeAuditValue);
  if (typeof value !== "object" || value === null) return value;
  const sanitized: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (!SENSITIVE_FIELDS.has(key)) sanitized[key] = sanitizeAuditValue(item);
  }
  return sanitized;
}

export const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/i,
  /javascript:/i,
  /on\w+\s*=/i,
  /data:text\/html/i,
  /vbscript:/i,
];

export const NOSQL_INJECTION_PATTERNS = [
  /\$where/i,
  /\$regex/i,
  /\$gt\b/i,
  /\$lt\b/i,
  /\$ne\b/i,
  /\$in\b/i,
  /\$nin\b/i,
  /\$exists/i,
  /\$and\b/i,
  /\$or\b/i,
];

export const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|TRUNCATE)\b)/i,
  /(--|#|\/\*|\*\/)/,
  /(';\s*(DROP|DELETE|INSERT|UPDATE|SELECT))/i,
];

export const HEADER_INJECTION_PATTERNS = [
  /\r\n/i,
  /\n/i,
  /\r/i,
];

const MAX_SCAN_DEPTH = 10;

export function containsPattern(input: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(input));
}

export function scanObject(obj: Record<string, unknown>, depth = 0): string[] {
  if (depth > MAX_SCAN_DEPTH) return [];
  const violations: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (containsPattern(key, NOSQL_INJECTION_PATTERNS)) {
      violations.push(`Suspicious key: ${key}`);
    }

    if (typeof value === "string") {
      if (containsPattern(value, [...XSS_PATTERNS, ...SQL_INJECTION_PATTERNS, ...NOSQL_INJECTION_PATTERNS])) {
        violations.push(`Suspicious value in key: ${key}`);
      }
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      violations.push(...scanObject(value as Record<string, unknown>, depth + 1));
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "object" && item !== null) {
          violations.push(...scanObject(item as Record<string, unknown>, depth + 1));
        } else if (typeof item === "string") {
          if (containsPattern(item, [...XSS_PATTERNS, ...SQL_INJECTION_PATTERNS])) {
            violations.push(`Suspicious array item in key: ${key}`);
          }
        }
      }
    }
  }

  return violations;
}

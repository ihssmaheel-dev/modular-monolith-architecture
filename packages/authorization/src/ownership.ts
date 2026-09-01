const OWNERSHIP_FIELDS = {
  note: "createdBy",
  file: "uploadedBy",
  user: "id",
} as const;

export function resolveResourceOwnerId(
  resourceType: string,
  data: Record<string, unknown> | undefined,
): string | undefined {
  if (!data) return undefined;
  const field = OWNERSHIP_FIELDS[resourceType as keyof typeof OWNERSHIP_FIELDS];
  const value = field ? data[field] : (data.ownerId ?? data.owner_id);
  return typeof value === "string" ? value : undefined;
}

export function getOwnershipField(resourceType: string): string | undefined {
  return OWNERSHIP_FIELDS[resourceType as keyof typeof OWNERSHIP_FIELDS];
}

import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from "../constants";

export function paginate(page?: number, limit?: number) {
  const safePage = Math.max(1, page ?? 1);
  const safeLimit = Math.min(MAX_PAGE_LIMIT, Math.max(1, limit ?? DEFAULT_PAGE_LIMIT));
  const skip = (safePage - 1) * safeLimit;

  return { page: safePage, limit: safeLimit, skip };
}

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
